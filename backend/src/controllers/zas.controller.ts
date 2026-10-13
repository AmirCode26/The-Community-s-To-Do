import type { Request, Response, NextFunction } from "express";
import * as ZAService from "../prisma/methods/zas";

export async function listZAsBySubNig(req: Request, res: Response, next: NextFunction) {
  try {
    if (typeof (req.params.subNigId) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");
    const zas = await ZAService.listZAsBySubNig(req.params.subNigId);
    res.json(zas);
  } catch (error) {
    next(error);
  }
}

export async function createZA(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("UNAUTHORIZED");
    const newZA = await ZAService.createZA(req.body, req.user.role);
    res.status(201).json(newZA);
  } catch (error) {
    next(error);
  }
}

export async function updateZAStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("UNAUTHORIZED");
    const { status } = req.body;
    if (typeof (req.params.zaId) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");

    const updated = await ZAService.updateZAStatus(req.params.zaId, status, req.user.role);
    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function listTasksByZA(req: Request, res: Response, next: NextFunction) {
  if (typeof (req.params.zaId) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");
  try {
    const tasks = await ZAService.listTasksByZA(req.params.zaId);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("UNAUTHORIZED");
    const newTask = await ZAService.createTask(req.body, req.user.role);
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
}

export async function castTaskVote(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("UNAUTHORIZED");
    const vote = await ZAService.castTaskVote(req.body, {
      id: req.user.id,
      status: req.user.status || "ACTIVE",
    });
    res.json(vote);
  } catch (error) {
    next(error);
  }
}
