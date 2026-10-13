import { db } from "../db.ts";

export interface CreateZAInput {
  subNigId: string;
  title: string;
  description: string;
  priority?: number;
}

export interface CreateTaskInput {
  zaId: string;
  title: string;
  description?:  | null;
}

export interface CastVoteInput {
  taskId: string;
  approved: boolean;
  comment?: string | null;
}

// ------------------------------------------------------
// 1. ZONES OF ACTION (ZAs)
// ------------------------------------------------------

export async function listZAsBySubNig(subNigId: string) {
  return await db.orm.public.ZoneOfAction.select(
    "id",
    "subNigId",
    "title",
    "description",
    "priority",
    "status",
    "createdAt",
  )
    .include("tasks")
    .where({ subNigId })
    .all();
}

export async function createZA(input: CreateZAInput, requesterRole: string) {
  if (requesterRole !== "L_NIG" && requesterRole !== "L_SNIG") {
    throw new Error(
      "Access denied: Only L_NIG or L_SNIG can create Zones of Action.",
    );
  }

  return await db.orm.public.ZoneOfAction.create({
    subNigId: input.subNigId,
    title: input.title,
    description: input.description,
    priority: input.priority ?? 1,
    status: "PENDING",
  });
}

// Update Zone of Action status (PENDING -> IN_PROGRESS -> COMPLETED)
export async function updateZAStatus(
  zaId: string,
  newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED",
  requesterRole: string,
) {
  if (requesterRole !== "L_NIG" && requesterRole !== "L_SNIG") {
    throw new Error(
      "Access denied: Leadership permissions required to update ZA status.",
    );
  }

  return await db.orm.public.ZoneOfAction.where({ id: zaId }).update({
    status: newStatus,
  });
}

export async function deleteZA(zaId: string, requesterRole: string) {
  if (requesterRole !== "L_NIG" && requesterRole !== "L_SNIG") {
    throw new Error(
      "Access denied: Only leadership can delete Zones of Action.",
    );
  }

  await db.orm.public.ZoneOfAction.where({ id: zaId }).delete();

  return { success: true, deletedId: zaId };
}

// ------------------------------------------------------
// 2. TASKS (Linked to a ZA)
// ------------------------------------------------------

export async function listTasksByZA(zaId: string) {
  return await db.orm.public.Task.select(
    "id",
    "zaId",
    "title",
    "description",
    "status",
    "createdAt",
  )
    .include("votes")
    .where({ zaId })
    .all();
}

export async function createTask(
  input: CreateTaskInput,
  requesterRole: string,
) {
  if (requesterRole === "I_T") {
    throw new Error(
      "Access denied: Regular members cannot directly create tasks.",
    );
  }

  return await db.orm.public.Task.create({
    zaId: input.zaId,
    title: input.title,
    description: input.description ?? null,
    status: "PENDING",
  });
}

// Update Task status (PENDING -> IN_PROGRESS -> COMPLETED)
export async function updateTaskStatus(
  taskId: string,
  newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED",
  requesterRole: string,
) {
  if (requesterRole === "I_T") {
    throw new Error(
      "Access denied: Leadership permissions required to update task status.",
    );
  }

  return await db.orm.public.Task.where({ id: taskId }).update({
    status: newStatus,
  });
}

export async function deleteTask(taskId: string, requesterRole: string) {
  if (requesterRole === "I_T") {
    throw new Error(
      "Access denied: Leadership permissions required to delete tasks.",
    );
  }

  await db.orm.public.Task.where({ id: taskId }).delete();

  return { success: true, deletedId: taskId };
}

// ------------------------------------------------------
// 3. VOTES & CONSENSUS MOTOR
// ------------------------------------------------------

export async function castTaskVote(
  input: CastVoteInput,
  requesterUser: { id: string; status: string },
) {
  if (
    requesterUser.status === "BANNED" ||
    requesterUser.status === "TEMPORARY_BAN"
  ) {
    throw new Error(
      "Sanctioned users are not allowed to participate in voting.",
    );
  }

  // Prevent duplicate votes using taskId + userId unique constraint
  const existingVote = await db.orm.public.TaskVote.where({
    taskId: input.taskId,
    userId: requesterUser.id,
  }).first();

  if (existingVote) {
    return await db.orm.public.TaskVote.where({ id: existingVote.id }).update({
      approved: input.approved,
      comment: input.comment ?? null,
    });
  }

  return await db.orm.public.TaskVote.create({
    taskId: input.taskId,
    userId: requesterUser.id,
    approved: input.approved,
    comment: input.comment ?? null,
  });
}
