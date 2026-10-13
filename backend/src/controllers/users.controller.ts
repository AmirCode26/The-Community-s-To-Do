import type { Request, Response, NextFunction } from "express";
import * as UserService from "../prisma/methods/users";
import { db } from "../prisma/db";

export async function loginUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { phoneNumber, password } = req.body;
        if (!phoneNumber || !password) throw new Error("Faltan credenciales requeridas");

        const user = await UserService.loginUser(phoneNumber, password);
        res.json(user);
    } catch (error) {
        next(error);
    }
}

export async function listUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const users = await UserService.listUsers();
        res.json(users);
    } catch (error) {
        next(error);
    }
}
export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new Error("No autenticado");
    const { id } = req.params;
    if (typeof (id) != "string") return res.status(400).json("BAD PARAMS AT REQUEST");

    const user = await UserService.getUserProfile(id, req.user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
}
export async function createUser(req: Request, res: Response, next: NextFunction) {
    try {
        const newUser = await UserService.createUser(req.body, req.user);
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
}

export async function updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.user) throw new Error("No autenticado");
        const { id } = req.params;
        const { status } = req.body;
        if (typeof (id) != "string") return res.status(400);
        if (status != "PENDING" && status != "ACTIVE" && status != "TEMPORARY_BAN" && status != "BANNED") return res.status(400).json("BAD PARAMS AT REQUEST");

        await UserService.updateUserStatus(id, status, req.user);
        const updatedUser = await db.orm.public.User.where({ id }).first();
        res.json(updatedUser);
    } catch (error) {
        next(error);
    }
}
