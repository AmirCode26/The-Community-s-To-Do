import { Router } from "express";
import * as ZAsController from "../controllers/zas.controller";

const router = Router();

router.get("/subnig/:subNigId", ZAsController.listZAsBySubNig);
router.post("/", ZAsController.createZA);
router.patch("/:zaId/status", ZAsController.updateZAStatus);

router.get("/:zaId/tasks", ZAsController.listTasksByZA);
router.post("/tasks", ZAsController.createTask);

router.post("/tasks/vote", ZAsController.castTaskVote);

export default router;
