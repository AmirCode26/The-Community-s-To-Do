import { Router } from "express";
import * as PostsController from "../controllers/posts.controller";

const router = Router();

router.get("/board/:boardId", PostsController.listPostsByBoard);
router.post("/", PostsController.createPost);
router.put("/:postId", PostsController.updatePost);
router.delete("/:postId", PostsController.deletePost);

export default router;
