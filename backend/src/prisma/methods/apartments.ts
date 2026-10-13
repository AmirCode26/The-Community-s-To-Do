import { db } from "../db.ts";

export { db };

// ------------------------------------------------------
// CONSTANTS & TYPES
// ------------------------------------------------------
const DAY_MS = 24 * 60 * 60 * 1000;
export const APARTMENT_UPDATE_COOLDOWN_MS = 15 * DAY_MS;
const MAX_NAME_LENGTH = 50;

/**
 * Only `id` is trusted. Role and status are always re-read from the
 * database, so a stale cookie/JWT can never grant extra permissions.
 */
export interface RequesterRef {
    id: string;
    role?: string;
    status?: string;
}

export interface CreateApartmentInput {
    towerId: string;
    name: string;
}

export interface UpdateApartmentInput {
    name: string;
}

// ------------------------------------------------------
// SHARED GUARDS (also used by report.ts)
// ------------------------------------------------------

// Fresh requester from the DB + sanction check.
export async function loadRequester(ref: RequesterRef) {
    const user = await db.orm.public.User.select("id", "role", "status")
    .where({ id: ref.id })
    .first();

    if (!user) throw new Error("Requester not found.");

    if (user.status === "BANNED" || user.status === "TEMPORARY_BAN") {
        throw new Error("Account is currently sanctioned.");
    }

    return user;
}

function requireLeaderRole(role: string) {
    if (role !== "L_NIG" && role !== "L_SNIG") {
        throw new Error("Insufficient role permissions.");
    }
}

async function getSubNigIdOfTower(towerId: string): Promise<string | null> {
    const tower = await db.orm.public.Tower.select("subNigId")
    .where({ id: towerId })
    .first();

    return tower ? tower.subNigId : null;
}

export async function getSubNigIdOfApartment(
    apartmentId: string,
): Promise<string | null> {
    const apartment = await db.orm.public.Apartment.select("towerId")
    .where({ id: apartmentId })
    .first();

    if (!apartment) return null;
    return await getSubNigIdOfTower(apartment.towerId);
}

// User -> Apartment -> Tower -> SubNig
export async function getSubNigIdOfUser(
    userId: string,
): Promise<string | null> {
    const user = await db.orm.public.User.select("apartmentId")
    .where({ id: userId })
    .first();

    if (!user || !user.apartmentId) return null;
    return await getSubNigIdOfApartment(user.apartmentId);
}

// L_NIG manages everything. L_SNIG only the sectors it leads
// (explicit LeadershipAssignment of type S_NIG).
export async function canManageSubNig(
    user: { id: string; role: string },
    subNigId: string,
): Promise<boolean> {
    if (user.role === "L_NIG") return true;
    if (user.role !== "L_SNIG") return false;

    const assignment = await db.orm.public.LeadershipAssignment.select("id")
    .where({ userId: user.id, type: "S_NIG", structureId: subNigId })
    .first();

    return Boolean(assignment);
}

async function assertCanManageTower(
    user: { id: string; role: string },
    towerId: string,
) {
    const subNigId = await getSubNigIdOfTower(towerId);
    if (!subNigId) throw new Error("Tower not found.");

    if (!(await canManageSubNig(user, subNigId))) {
        throw new Error("Access denied: you do not lead the sector of this tower.");
    }
}

function cleanName(raw: string): string {
    const name = raw.trim();
    if (name.length === 0 || name.length > MAX_NAME_LENGTH) {
        throw new Error(
            `Apartment name must be between 1 and ${MAX_NAME_LENGTH} characters.`,
        );
    }
    return name;
}

// ------------------------------------------------------
// 1. LIST APARTMENTS BY TOWER
// (no requester: the registration form needs it; Express decides exposure)
// ------------------------------------------------------
export async function listApartmentsByTower(towerId: string, limit = 100) {
    return await db.orm.public.Apartment.select("id", "name", "towerId")
    .where({ towerId })
    .limit(limit)
    .all();
}

// ------------------------------------------------------
// 2. GET APARTMENT
// ------------------------------------------------------
export async function getApartment(apartmentId: string) {
    const apartment = await db.orm.public.Apartment.select(
        "id",
        "name",
        "towerId",
    )
    .where({ id: apartmentId })
    .first();

    if (!apartment) throw new Error("Apartment not found.");

    return apartment;
}

// ------------------------------------------------------
// 3. CREATE APARTMENT (L_NIG / L_SNIG of the sector)
// ------------------------------------------------------
export async function createApartment(
    input: CreateApartmentInput,
    requesterRef?: RequesterRef,
) {
    const existingApartmentsCount = await db.orm.public.Apartment.select("id").all();
    const isBootstrap = existingApartmentsCount.length === 0;

    if (!isBootstrap) {
        if (!requesterRef) throw new Error("Unauthorized");
        const requester = await loadRequester(requesterRef);
        requireLeaderRole(requester.role);
        await assertCanManageTower(requester, input.towerId);
    }

    const name = cleanName(input.name);
    const duplicate = await db.orm.public.Apartment.select("id")
    .where({ towerId: input.towerId, name })
    .first();

    if (duplicate) {
        throw new Error("An apartment with this name already exists in this tower.");
    }

    return await db.orm.public.Apartment.create({
        towerId: input.towerId,
        name,
    });
}

// ------------------------------------------------------
// 4. UPDATE APARTMENT (15-day cooldown via lastUpdate)
// ------------------------------------------------------
export async function updateApartment(
    apartmentId: string,
    input: UpdateApartmentInput,
    requesterRef: RequesterRef,
) {
    const requester = await loadRequester(requesterRef);
    requireLeaderRole(requester.role);

    const name = cleanName(input.name);

    const apartment = await db.orm.public.Apartment.select(
        "id",
        "towerId",
        "lastUpdate",
    )
    .where({ id: apartmentId })
    .first();

    if (!apartment) throw new Error("Apartment not found.");

    await assertCanManageTower(requester, apartment.towerId);

    // L_NIG is exempt from the cooldown (same idea as the post edit window)
    if (requester.role !== "L_NIG" && apartment.lastUpdate) {
        const nextAllowed =
        new Date(apartment.lastUpdate).getTime() + APARTMENT_UPDATE_COOLDOWN_MS;
        const remainingMs = nextAllowed - Date.now();

        if (remainingMs > 0) {
            throw new Error(
                `Update cooldown active. Please wait ${Math.ceil(remainingMs / DAY_MS)} day(s) before editing this apartment again.`,
            );
        }
    }

    const duplicate = await db.orm.public.Apartment.select("id")
    .where({ towerId: apartment.towerId, name })
    .first();

    if (duplicate && duplicate.id !== apartment.id) {
        throw new Error("An apartment with this name already exists in this tower.");
    }

    return await db.orm.public.Apartment.where({ id: apartmentId }).update({
        name,
        lastUpdate: new Date().toISOString(),
    });
}

// ------------------------------------------------------
// 5. DELETE APARTMENT (only when empty)
// ------------------------------------------------------
export async function deleteApartment(
    apartmentId: string,
    requesterRef: RequesterRef,
) {
    const requester = await loadRequester(requesterRef);
    requireLeaderRole(requester.role);

    const apartment = await db.orm.public.Apartment.select("id", "towerId")
    .where({ id: apartmentId })
    .first();

    if (!apartment) throw new Error("Apartment not found.");

    await assertCanManageTower(requester, apartment.towerId);

    const resident = await db.orm.public.User.select("id")
    .where({ apartmentId })
    .first();

    if (resident) {
        throw new Error("Apartment still has residents. Move them out first.");
    }

    await db.orm.public.Apartment.where({ id: apartmentId }).delete();

    return { success: true, deletedId: apartmentId };
}

// ------------------------------------------------------
// 6. LIST RESIDENTS (leaders of the sector only)
// ------------------------------------------------------
export async function listResidents(
    apartmentId: string,
    requesterRef: RequesterRef,
    limit = 100,
) {
    const requester = await loadRequester(requesterRef);
    requireLeaderRole(requester.role);

    const apartment = await db.orm.public.Apartment.select("id", "towerId")
    .where({ id: apartmentId })
    .first();

    if (!apartment) throw new Error("Apartment not found.");

    await assertCanManageTower(requester, apartment.towerId);

    return await db.orm.public.User.select(
        "id",
        "fullName",
        "nickname",
        "status",
        "role",
    )
    .where({ apartmentId })
    .limit(limit)
    .all();
}

// ------------------------------------------------------
// 7. VERIFY RESIDENT (PENDING -> ACTIVE, done by the sector's L_SNIG)
// ------------------------------------------------------
export async function verifyResident(
    userId: string,
    requesterRef: RequesterRef,
) {
    const requester = await loadRequester(requesterRef);
    requireLeaderRole(requester.role);

    const user = await db.orm.public.User.select("id", "status", "apartmentId")
    .where({ id: userId })
    .first();

    if (!user) throw new Error("User not found.");
    if (!user.apartmentId) {
        throw new Error("User has not selected an apartment.");
    }
    if (user.status !== "PENDING") {
        throw new Error("User is not pending verification.");
    }

    const apartment = await db.orm.public.Apartment.select("towerId")
    .where({ id: user.apartmentId })
    .first();

    if (!apartment) throw new Error("Apartment not found.");

    await assertCanManageTower(requester, apartment.towerId);

    await db.orm.public.User.where({ id: userId }).update({ status: "ACTIVE" });

    return { success: true, verifiedId: userId };
}
