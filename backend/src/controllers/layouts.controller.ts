import type { Request, Response, NextFunction } from "express";
import * as LayoutService from "../prisma/methods/layouts";

export async function getLayout(req: Request, res: Response, next: NextFunction) {
  try {
    if (typeof (req.params.structureId) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");
    const { structureType, structureId } = req.params;

    const layout = await LayoutService.getLayout(
      structureType as "GLOBAL" | "S_NIG" | "TOWER",
      structureId
    );
    res.json(layout);
  } catch (error) {
    next(error);
  }
}
export async function listLayouts(req: Request, res: Response, next: NextFunction) {
  try {
    const layouts = await LayoutService.listLayouts();
    res.json(layouts);
  } catch (error) {
    next(error);
  }
}
export async function upsertLayout(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("UNAUTHORIZED");
    const layout = await LayoutService.upsertLayout(req.body, req.user.role);
    res.status(201).json(layout);
  } catch (error) {
    next(error);
  }
}
