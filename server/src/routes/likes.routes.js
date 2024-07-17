import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  toggleVideoLike,
  toggleVideoDislike,
  toggleCommentLike,
  toggleCommentDislike,
  togglePlaylistLike,
  togglePlaylistDislike,
  getLikedVideos,
} from "../controllers/like.controller.js";

const likeRouter = Router();
likeRouter.use(verifyJWT);

likeRouter.get("/toggleVideoLike", toggleVideoLike);
likeRouter.get("/toggleVideoDislike", toggleVideoDislike);
likeRouter.get("/toggleCommentLike", toggleCommentLike);
likeRouter.get("/toggleCommentDislike", toggleCommentDislike);
likeRouter.get("/togglePlaylistLike", togglePlaylistLike);
likeRouter.get("/togglePlaylistDislike", togglePlaylistDislike);
likeRouter.get("/getLikedVideos", getLikedVideos);

export default likeRouter;