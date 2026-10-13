import { Router } from "express";
import * as StructuresController from "../controllers/structures.controller";

const router = Router();

router.get("/:type", StructuresController.getStructuresByType);
router.post("/:type", StructuresController.createStructureByType);

export default router;
