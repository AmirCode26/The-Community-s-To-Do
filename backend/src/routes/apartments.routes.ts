import { Router } from "express";
import * as ApartmentController from "../controllers/apartments.controller";

const router = Router();

router.get("/tower/:towerId", ApartmentController.listApartmentsByTower);
router.get("/:aptId", ApartmentController.getApartmentById);
router.post("/", ApartmentController.createApartment);

export default router;
