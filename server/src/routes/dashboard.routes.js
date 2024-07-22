import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const dashboardRouter = Router();

dashboardRouter.use(verifyJWT);

dashboardRouter.get("/getChannelStats", getChannelStats);
dashboardRouter.get("/getChannelVideos", getChannelVideos);

export default dashboardRouter;