import { Router } from "express";
import * as UsersController from "../controllers/users.controller";

const router = Router();

router.post("/login", UsersController.loginUser);
router.get("/", UsersController.listUsers);
router.post("/", UsersController.createUser);
router.patch("/:id/status", UsersController.updateUserStatus);
router.get("/:id/", UsersController.getUserById);
router.patch("/:id/role", UsersController.updateUserRole);

export default router;
