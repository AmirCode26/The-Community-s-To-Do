import type { Request, Response, NextFunction } from "express";
import * as SubNigService from "../prisma/methods/structures";

export async function getStructuresByType(req: Request, res: Response, next: NextFunction) {
    try {
        const { type } = req.params;

        if (type === "S_NIG") {
            const snigs = await SubNigService.listSubNigs();
            return res.json(snigs);
        }

        if (type === "TOWER") {
            const { subNigId } = req.query;
            if (!subNigId) throw new Error("Se requiere subNigId para listar torres");
            const towers = await SubNigService.listTowersBySubNig(subNigId as string);
            return res.json(towers);
        }

        throw new Error("Tipo de estructura inválido (usa 'snig' o 'tower')");
    } catch (error) {
        next(error);
    }
}

export async function createStructureByType(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new Error("No autenticado");
        const { type } = req.params;

        if (type === "S_NIG") {
            const snig = await SubNigService.createSubNig(req.body, req.user.role);
            return res.status(201).json(snig);
        }

        if (type === "TOWER") {
            const tower = await SubNigService.createTower(req.body, req.user.role);
            return res.status(201).json(tower);
        }

        throw new Error("Tipo de estructura inválido");
    } catch (error) {
        next(error);
    }
}
