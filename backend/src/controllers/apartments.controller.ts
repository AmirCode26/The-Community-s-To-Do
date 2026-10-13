import type { Request, Response, NextFunction } from "express";
import * as ApartmentService from "../prisma/methods/apartments";

export async function listApartmentsByTower(req: Request, res: Response, next: NextFunction) {
  try {
    if (typeof (req.params.towerId) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");

        const apartments = await ApartmentService.listApartmentsByTower(req.params.towerId);
        res.json(apartments);
    } catch (error) {
        next(error);
    }
}
export async function getApartmentById(req: Request, res: Response, next: NextFunction) {
  try {
    const { aptId } = req.params;
    if (typeof (aptId) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");

    const user = await ApartmentService.getApartment(aptId);
    if (!user) {
      return res.status(404).json({ error: "Apartment not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}
export async function createApartment(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new Error("No autenticado");
        const apartment = await ApartmentService.createApartment(req.body, req.user);
        res.status(201).json(apartment);
    } catch (error) {
        next(error);
    }
}
