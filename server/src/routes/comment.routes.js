import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {getVideoComments, addComment, reply, updateComment, deleteComment } from "../controllers/comment.controller.js";

const commentRouter = Router();

commentRouter.get("/getComments", verifyJWT, getVideoComments);
commentRouter.post("/addComment", verifyJWT, addComment);
commentRouter.post("/reply", verifyJWT, reply);
commentRouter.patch("/updateComment", verifyJWT, updateComment);
commentRouter.delete("/deleteComment", verifyJWT, deleteComment);

export default commentRouter;