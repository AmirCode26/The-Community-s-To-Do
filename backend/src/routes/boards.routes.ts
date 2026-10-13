import { Router } from "express";
import * as BoardsController from "../controllers/boards.controller";

const router = Router();

router.get("/", BoardsController.listBoards);
router.post("/", BoardsController.createBoard);
router.get("/:boardId", BoardsController.getBoardById); // <-- Nueva ruta agregada

export default router;
