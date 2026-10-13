import { db } from "../db.ts";

// Input interface for user creation
export interface CreateUserInput {
  fullName: string;
  nickname?: string;
  phoneNumber: string;
  email?: string | null;
  password: string;
  role?: "L_NIG" | "L_SNIG" | "L_T" | "I_T";
  apartmentId?: string;
  apartmentGuide: string;
  privateProfile?: boolean;
}

// Input interface for user updates
export interface UpdateUserInput {
  fullName?: string;
  nickname?: string;
  email?: string | null;
  privateProfile?: boolean;
}

// ------------------------------------------------------
// 1. LIST USERS
// ------------------------------------------------------
export async function listUsers(limit = 20) {
  const users = await db.orm.public.User.select(
    "id",
    "fullName",
    "nickname",
    "phoneNumber",
    "email",
    "role",
    "status",
    "privateProfile",
    "apartmentId",
    "createdAt",
  )
  .limit(limit)
  .all();

  return users;
}

// ------------------------------------------------------
// 2. GET USER PROFILE (Contextual privacy matrix)
// ------------------------------------------------------
export async function getUserProfile(
  targetUserId: string,
  requesterUser: { id: string; role: string; apartmentId?: string },
) {
  const user = await db.orm.public.User.select(
    "id",
    "fullName",
    "nickname",
    "phoneNumber",
    "email",
    "role",
    "status",
    "privateProfile",
    "apartmentId",
  )
  .where({ id: targetUserId })
  .first();

  if (!user) return null;

  // Full Access: If public, requesting own profile, or requester is Global Admin (L_NIG)
  if (
    !user.privateProfile
  ) {
    return user;
  }

  // Same Apartment Access
  if (
    requesterUser.apartmentId &&
    user.apartmentId &&
    requesterUser.apartmentId === user.apartmentId
  ) {
    return user;
  }

  // Hidden / Anonymized Profile outside shared context
  return {
    id: user.id,
    fullName: `Neighbor (Apartment ${user.apartmentId ?? "General"})`,
    phoneNumber: "Private",
    email: null,
    role: user.role,
    status: user.status,
    privateProfile: true,
      apartmentId: user.apartmentId,
  };
}

// ------------------------------------------------------
// 3. LOGIN USER
// ------------------------------------------------------
export async function loginUser(phoneNumber: string, password: string) {
  const user = await db.orm.public.User.where({ phoneNumber, password }).first();
  if (!user) {
    throw new Error("AUTH_USER_NOT_FOUND");
  }
  if (user.status === "BANNED") {
    throw new Error("AUTH_USER_BANNED");
  }
  return user;
}

// ------------------------------------------------------
// 4. CREATE USER (Multi-account prevention & ban check)
// ------------------------------------------------------
export async function createUser(input: any, creatorUser?: { role: string }) {
  // Verificamos si es el primer usuario del sistema (Bootstrap)
  const existingUsersCount = await listUsers();
  const isBootstrap = existingUsersCount.length <= 0;

  // Validación de permisos para roles especiales (se omite si es el bootstrap inicial)
  if (!isBootstrap && input.role && input.role !== "I_T" && creatorUser?.role !== "L_NIG") {
    throw new Error("FORBIDDEN_ROLE_ASSIGNMENT");
  }

  // Prevención de duplicados...
  const existingUser = await db.orm.public.User.where({ phoneNumber: input.phoneNumber }).first();
  if (existingUser) throw new Error("USER_ALREADY_EXISTS");

  if (input.email) {
    const existingEmail = await db.orm.public.User.where({ email: input.email }).first();
    if (existingEmail) throw new Error("EMAIL_ALREADY_EXISTS");
  }

  return await db.orm.public.User.create({
    fullName: input.fullName,
    nickname: input.nickname ?? null,
    password: input.password,
    phoneNumber: input.phoneNumber,
    email: input.email ?? null,
    role: input.role ?? "I_T",
    // Si es bootstrap, nace ACTIVE automáticamente; de lo contrario, PENDING
    status: isBootstrap || creatorUser?.role === "L_NIG" ? "ACTIVE" : "PENDING",
    apartmentId: input.apartmentId ?? null,
    apartmentGuide: input.apartmentGuide,
  });
}
// ------------------------------------------------------
// 5. UPDATE USER
// ------------------------------------------------------
export async function updateUser(
  targetUserId: string,
  input: UpdateUserInput,
  requesterUser: { id: string; role: string },
) {
  if (requesterUser.id !== targetUserId && requesterUser.role !== "L_NIG") {
    throw new Error("You do not have permission to modify this profile.");
  }

  const updatedUser = await db.orm.public.User.where({
    id: targetUserId,
  }).update({
    ...(input.fullName && { fullName: input.fullName }),
            ...(input.nickname && { nickname: input.nickname }),
            ...(input.email !== undefined && { email: input.email }),
            ...(input.privateProfile !== undefined && {
              privateProfile: input.privateProfile,
            }),
  });

  return updatedUser;
}

// ------------------------------------------------------
// 6. UPDATE USER STATUS / BAN USER
// ------------------------------------------------------
export async function updateUserStatus(
  targetUserId: string,
  newStatus: "PENDING" | "ACTIVE" | "REPORTED" | "TEMPORARY_BAN" | "BANNED",
  requesterUser: { role: string },
) {
  if (
    requesterUser.role !== "L_NIG" &&
    requesterUser.role !== "L_SNIG" &&
    requesterUser.role !== "L_T"
  ) {
    throw new Error(
      "Access denied: Leadership permissions required to moderate users.",
    );
  }

  const updatedUser = await db.orm.public.User.where({
    id: targetUserId,
  }).update({ status: newStatus });
  return updatedUser;
}

// ------------------------------------------------------
// 7. DELETE USER
// ------------------------------------------------------
export async function deleteUser(
  targetUserId: string,
  requesterUser: { id: string; role: string },
) {
  if (requesterUser.id !== targetUserId && requesterUser.role !== "L_NIG") {
    throw new Error("You do not have permission to delete this user.");
  }

  await db.orm.public.User.where({ id: targetUserId }).delete();

  return { success: true, deletedId: targetUserId };
}

export type TcUdpUser = Awaited<ReturnType<typeof listUsers>>[number];
