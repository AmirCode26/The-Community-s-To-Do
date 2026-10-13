import type { Request, Response, NextFunction } from "express";
import * as ReportService from "../prisma/methods/reports";

export async function createReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("No autenticado");
    const newReport = await ReportService.createReport(req.body, { id: req.user.id });
    res.status(201).json(newReport);
  } catch (error) {
    next(error);
  }
}

export async function listMyReports(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("No autenticado");
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const reports = await ReportService.listMyReports({ id: req.user.id }, limit);
    res.json(reports);
  } catch (error) {
    next(error);
  }
}

export async function listReportsAgainstUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("No autenticado");
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    if (typeof (req.params.userId) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");

    const reports = await ReportService.listReportsAgainstUser(
      req.params.userId,
      { id: req.user.id },
      limit
    );
    res.json(reports);
  } catch (error) {
    next(error);
  }
}

export async function getReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("No autenticado");
    if (typeof (req.params.id) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");

    const report = await ReportService.getReport(req.params.id, { id: req.user.id });
    res.json(report);
  } catch (error) {
    next(error);
  }
}

export async function deleteReport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("No autenticado");
    if (typeof (req.params.id) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");

    const result = await ReportService.deleteReport(req.params.id, { id: req.user.id });
    res.json(result);
  } catch (error) {
    next(error);
  }
}
