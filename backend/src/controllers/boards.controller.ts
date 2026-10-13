import type { Request, Response, NextFunction } from "express";
import * as BoardService from "../prisma/methods/boards";

export async function listBoards(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("No autenticado");
    const boards = await BoardService.listBoards(req.user);
    res.json(boards);
  } catch (error) {
    next(error);
  }
}

export async function createBoard(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("No autenticado");
    const newBoard = await BoardService.createBoard(req.body, req.user);
    res.status(201).json(newBoard);
  } catch (error) {
    next(error);
  }
}

export async function getBoardById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("No autenticado");
    const { boardId } = req.params;
    if (typeof (boardId) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");

    const board = await BoardService.getBoardById(boardId, req.user);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    res.json(board);
  } catch (error) {
    next(error);
  }
}
