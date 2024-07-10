import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { createOrUpdatePlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, addRemoveVideoFromPlaylist, deletePlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const playlistRouter = Router();

playlistRouter.post("/create", verifyJWT, createOrUpdatePlaylist);
playlistRouter.get("/userPlaylists", verifyJWT, getUserPlaylists);
playlistRouter.get("/userPlaylist", verifyJWT, getPlaylistById);
playlistRouter.get("/editVideoList", verifyJWT, addRemoveVideoFromPlaylist);

export default playlistRouter;