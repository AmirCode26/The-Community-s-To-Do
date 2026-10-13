import { Router } from "express";
import * as ReportsController from "../controllers/reports.controller";

const router = Router();

router.post("/", ReportsController.createReport);
router.get("/my", ReportsController.listMyReports);
router.get("/user/:userId", ReportsController.listReportsAgainstUser);
router.get("/:id", ReportsController.getReport);
router.delete("/:id", ReportsController.deleteReport);

export default router;
