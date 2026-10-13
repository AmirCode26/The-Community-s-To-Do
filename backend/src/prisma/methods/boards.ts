import { db } from "../db.ts";
export interface CreateBoardInput {
  title: string;
  type?: "ANNOUNCEMENT" | "DISCUSSION";
  ownerStructureType: "GLOBAL" | "S_NIG" | "TOWER";
  subNigId?: string | null;
  towerId?: string | null;
  minReadRole?: "L_NIG" | "L_SNIG" | "L_T" | "I_T";
  minWriteRole?: "L_NIG" | "L_SNIG" | "L_T" | "I_T";
  exactWriteRole?: "L_NIG" | "L_SNIG" | "L_T" | "I_T" | null;
  cooldownSeconds?: number;
}

// Role Hierarchy Helper
const ROLE_HIERARCHY: Record<string, number> = {
  I_T: 1,
  L_T: 2,
  L_SNIG: 3,
  L_NIG: 4,
};

// ------------------------------------------------------
// BOARD OPERATIONS
// ------------------------------------------------------

export async function listBoards(requesterUser: {
  role: string;
  towerId?: string;
}) {
  const allBoards = await db.orm.public.Board.select(
    "id",
    "title",
    "type",
    "ownerStructureType",
    "subNigId",
    "towerId",
    "minReadRole",
    "minWriteRole",
    "exactWriteRole",
    "cooldownSeconds",
  ).all();

  // Filter boards based on requester's role level
  const requesterLevel = ROLE_HIERARCHY[requesterUser.role] ?? 0;
  return allBoards.filter((board) => {
    const minReadLevel = ROLE_HIERARCHY[board.minReadRole] ?? 1;
    return requesterLevel >= minReadLevel;
  });
}

export async function createBoard(
  input: CreateBoardInput,
  requesterUser: { role: string },
) {
  // Board creation restricted to leadership roles
  if (requesterUser.role === "I_T") {
    throw new Error("Access denied: Regular users cannot create boards.");
  }

  return await db.orm.public.Board.create({
    title: input.title,
    type: input.type ?? "DISCUSSION",
    ownerStructureType: input.ownerStructureType,
    subNigId: input.subNigId ?? null,
    towerId: input.towerId ?? null,
    minReadRole: input.minReadRole ?? "I_T",
    minWriteRole: input.minWriteRole ?? "I_T",
    exactWriteRole: input.exactWriteRole ?? null,
    cooldownSeconds: input.cooldownSeconds ?? 60,
  });
}

// Helper: Check if user has write permissions for a board
export function canUserWriteToBoard(
  board: { minWriteRole: string; exactWriteRole?: string | null },
  userRole: string,
): boolean {
  if (userRole === "L_NIG") return true; // Global admin override

  if (board.exactWriteRole) {
    return userRole === board.exactWriteRole;
  }

  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const minWriteLevel = ROLE_HIERARCHY[board.minWriteRole] ?? 1;

  return userLevel >= minWriteLevel;
}
export async function deleteBoard(boardId: string, requesterRole: string) {
  if (requesterRole !== "L_NIG" && requesterRole !== "L_SNIG") {
    throw new Error(
      "Access denied: Leadership permissions required to delete boards.",
    );
  }

  await db.orm.public.Board.where({ id: boardId }).delete();

  return { success: true, deletedId: boardId };
}
export async function getBoardById(
  boardId: string,
  requesterUser: { role: string; towerId?: string },
) {
  // Buscar el tablón por su ID usando el ORM
  const board = await db.orm.public.Board.where({ id: boardId }).first();

  if (!board) {
    return null;
  }

  // Validar permisos de lectura basados en la jerarquía de roles
  const requesterLevel = ROLE_HIERARCHY[requesterUser.role] ?? 0;
  const minReadLevel = ROLE_HIERARCHY[board.minReadRole] ?? 1;

  if (requesterLevel < minReadLevel) {
    throw new Error("Access denied: Insufficient permissions to read this board.");
  }

  return board;
}
