
import { db } from "../db.ts";
import { canUserWriteToBoard } from "./boards.ts";

export { db };

export interface CreatePostInput {
  boardId: string;
  authorId: string;
  content: string;
}

export interface UpdatePostInput {
  content: string;
}

// ------------------------------------------------------
// 1. LIST POSTS BY BOARD
// ------------------------------------------------------
export async function listPostsByBoard(boardId: string, limit = 50) {
  return await db.orm.public.Post.select(
    "id",
    "boardId",
    "authorId",
    "content",
    "editUntil",
    "createdAt",
  )
    .include("author")
    .where({ boardId })
    .limit(limit)
    .all();
}

// ------------------------------------------------------
// 2. CREATE POST (With Board Roles & Cooldown Check)
// ------------------------------------------------------
export async function createPost(
  input: CreatePostInput,
  requesterUser: { id: string; role: string; status?: string },
) {
  if(!requesterUser.status) requesterUser.status = "PENDING"
  // 1. Sanction Check
  if (
    requesterUser.status === "BANNED" ||
    requesterUser.status === "TEMPORARY_BAN"
  ) {
    throw new Error("Account is currently sanctioned. Posting is disabled.");
  } else if (requesterUser.status === "PENDING") {
    throw new Error("Account isn't verified, you cannot post anything yet.");
  }

  // 2. Board Existence & Write Role Validation
  const board = await db.orm.public.Board.select(
    "id",
    "minWriteRole",
    "exactWriteRole",
    "cooldownSeconds",
  )
    .where({ id: input.boardId })
    .first();

  if (!board) {
    throw new Error("Board not found.");
  }

  if (!canUserWriteToBoard(board, requesterUser.role)) {
    throw new Error("Insufficient role permissions to post on this board.");
  }

  // 3. Cooldown Verification
  const now = new Date();
  const existingCooldown = await db.orm.public.BoardCooldown.where({
    boardId: input.boardId,
    userId: requesterUser.id,
  }).first();

  if (existingCooldown) {
    const cooldownEnd = new Date(existingCooldown.cooldownUntil);
    if (now < cooldownEnd) {
      const remainingSeconds = Math.ceil(
        (cooldownEnd.getTime() - now.getTime()) / 1000,
      );
      throw new Error(
        `Cooldown active. Please wait ${remainingSeconds} seconds before posting again.`,
      );
    }
  }

  // 4. Set 24-hour edit window
  const editUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  // 5. Create Post
  const newPost = await db.orm.public.Post.create({
    boardId: input.boardId,
    authorId: requesterUser.id,
    content: input.content,
    editUntil: editUntil,
  });

  // 6. Upsert Board Cooldown Record
  const newCooldownUntil = new Date(
    now.getTime() + board.cooldownSeconds * 1000,
  ).toISOString();

  if (existingCooldown) {
    await db.orm.public.BoardCooldown.where({ id: existingCooldown.id }).update(
      { cooldownUntil: newCooldownUntil },
    );
  } else {
    await db.orm.public.BoardCooldown.create({
      boardId: input.boardId,
      userId: requesterUser.id,
      cooldownUntil: newCooldownUntil,
    });
  }

  return newPost;
}

// ------------------------------------------------------
// 3. UPDATE POST (Time-limited)
// ------------------------------------------------------
export async function updatePost(
  postId: string,
  input: UpdatePostInput,
  requesterUser: { id: string; role: string },
) {
  const post = await db.orm.public.Post.select("id", "authorId", "editUntil")
    .where({ id: postId })
    .first();

  if (!post) throw new Error("Post not found.");

  // Author or L_NIG check
  if (post.authorId !== requesterUser.id && requesterUser.role !== "L_NIG") {
    throw new Error("You do not have permission to edit this post.");
  }

  // Check 24-hour edit limit for regular authors
  if (requesterUser.role !== "L_NIG") {
    const now = new Date();
    const editLimit = new Date(post.editUntil);
    if (now > editLimit) {
      throw new Error("The 24-hour edit window for this post has expired.");
    }
  }

  return await db.orm.public.Post.where({ id: postId }).update({
    content: input.content,
  });
}

// ------------------------------------------------------
// 4. DELETE POST
// ------------------------------------------------------
export async function deletePost(
  postId: string,
  requesterUser: { id: string; role: string },
) {
  const post = await db.orm.public.Post.select("id", "authorId")
    .where({ id: postId })
    .first();

  if (!post) throw new Error("Post not found.");

  // Only author or leadership roles can delete
  const isLeader = ["L_NIG", "L_SNIG", "L_T"].includes(requesterUser.role);
  if (post.authorId !== requesterUser.id && !isLeader) {
    throw new Error("Access denied: You cannot delete this post.");
  }

  await db.orm.public.Post.where({ id: postId }).delete();

  return { success: true, deletedId: postId };
}
