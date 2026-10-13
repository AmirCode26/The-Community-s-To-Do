import type { Request, Response, NextFunction } from "express";
import * as PostService from "../prisma/methods/posts";

export async function listPostsByBoard(req: Request, res: Response, next: NextFunction) {
  try {
    if (typeof (req.params.boardId) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");

    const posts = await PostService.listPostsByBoard(req.params.boardId);
    res.json(posts);
  } catch (error) {
    next(error);
  }
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("No autenticado");
    const newPost = await PostService.createPost(req.body, req.user);
    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("No autenticado");
    if (typeof (req.params.postId) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");

    const updatedPost = await PostService.updatePost(req.params.postId, req.body, req.user);
    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
}
export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("No autenticado");
    if (typeof (req.params.postId) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");

    await PostService.deletePost(req.params.postId, req.user);
    res.status(201);
  } catch (error) {
    next(error);
  }
}
