import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  createOrUpdatePlaylist,
  getUserPlaylists,
  getPlaylistById,
  addRemoveVideoFromPlaylist,
  deletePlaylist,
  updatePlaylistDetails,
} from "../controllers/playlist.controller.js";

const playlistRouter = Router();

playlistRouter.post("/create", verifyJWT, createOrUpdatePlaylist);

playlistRouter.get("/userPlaylists", verifyJWT, getUserPlaylists);

playlistRouter.get("/userPlaylist", verifyJWT, getPlaylistById);

playlistRouter.patch("/editVideoList", verifyJWT, addRemoveVideoFromPlaylist);

playlistRouter.delete("/deletePlaylist", verifyJWT, deletePlaylist);

playlistRouter.patch(
  "/updatePlaylistDetails",
  verifyJWT,
  updatePlaylistDetails
);

export default playlistRouter;
