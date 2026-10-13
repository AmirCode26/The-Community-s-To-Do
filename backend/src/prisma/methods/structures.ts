import { db } from "../db.ts";

export { db };

export interface CreateSubNigInput {
  name: string;
}

export interface UpdateSubNigInput {
  name: string;
}

export interface CreateTowerInput {
  name: string;
  subNigId: string;
}

export interface UpdateTowerInput {
  name?: string;
  subNigId?: string;
}

// ------------------------------------------------------
// SUB-NIG OPERATIONS
// ------------------------------------------------------

export async function listSubNigs() {
  return await db.orm.public.SubNig.select("id", "name", "createdAt")
    .include("towers")
    .all();
}

export async function createSubNig(
  input: CreateSubNigInput,
  requesterRole: string,
) {
  // Only Global Leader (L_NIG) can create SubNigs
  if (requesterRole !== "L_NIG") {
    throw new Error("Access denied: Only L_NIG can create SubNigs.");
  }

  return await db.orm.public.SubNig.create({
    name: input.name,
  });
}

export async function updateSubNig(
  subNigId: string,
  input: UpdateSubNigInput,
  requesterRole: string,
) {
  // Only Global Leader (L_NIG) can update SubNigs
  if (requesterRole !== "L_NIG") {
    throw new Error("Access denied: Only L_NIG can update SubNigs.");
  }

  return await db.orm.public.SubNig.where({ id: subNigId }).update({
    name: input.name,
  });
}

export async function deleteSubNig(subNigId: string, requesterRole: string) {
  if (requesterRole !== "L_NIG") {
    throw new Error("Access denied: Only L_NIG can delete SubNigs.");
  }

  await db.orm.public.SubNig.where({ id: subNigId }).delete();

  return { success: true, deletedId: subNigId };
}

// ------------------------------------------------------
// TOWER OPERATIONS
// ------------------------------------------------------

export async function listTowersBySubNig(subNigId: string) {
  return await db.orm.public.Tower.select("id", "name", "subNigId", "createdAt")
    .where({ subNigId })
    .all();
}

export async function createTower(
  input: CreateTowerInput,
  requesterRole?: string,
) {
  const existingTowersCount = await db.orm.public.Tower.select("id").all();
  const isBootstrap = existingTowersCount.length === 0;

  if (!isBootstrap) {
    if (requesterRole !== "L_NIG" && requesterRole !== "L_SNIG") {
      throw new Error(
        "Access denied: Leadership permissions required to create towers.",
      );
    }
  }

  return await db.orm.public.Tower.create({
    name: input.name,
    subNigId: input.subNigId,
  });
}

export async function updateTower(
  towerId: string,
  input: UpdateTowerInput,
  requesterRole: string,
) {
  // Only Global or Sector Leaders can update Towers
  if (requesterRole !== "L_NIG" && requesterRole !== "L_SNIG") {
    throw new Error(
      "Access denied: Leadership permissions required to update towers.",
    );
  }

  return await db.orm.public.Tower.where({ id: towerId }).update({
    ...(input.name && { name: input.name }),
    ...(input.subNigId && { subNigId: input.subNigId }),
  });
}

export async function deleteTower(towerId: string, requesterRole: string) {
  if (requesterRole !== "L_NIG" && requesterRole !== "L_SNIG") {
    throw new Error(
      "Access denied: Leadership permissions required to delete towers.",
    );
  }

  await db.orm.public.Tower.where({ id: towerId }).delete();

  return { success: true, deletedId: towerId };
}
