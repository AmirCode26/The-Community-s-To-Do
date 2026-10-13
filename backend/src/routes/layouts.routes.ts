import { Router } from "express";
import * as LayoutsController from "../controllers/layouts.controller";

const router = Router();

router.get("/:structureType/:structureId", LayoutsController.getLayout);
router.get("/", LayoutsController.listLayouts);
router.post("/", LayoutsController.upsertLayout);

export default router;
