import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getAllVideos,
  getVideoById,
  videoUpload,
  videoDelete,
  videoUpdate,
  togglePublishStatus,
} from "../controllers/video.controller.js";

const videoRouter = Router();

videoRouter.get("/home", getAllVideos);

videoRouter.post(
  "/upload",
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  videoUpload
);

videoRouter.get("/delete", verifyJWT, videoDelete);

videoRouter.patch(
  "/update",
  verifyJWT,
  upload.single("thumbnail"),
  videoUpdate
);

videoRouter.get("/getVideoById", getVideoById);

videoRouter.patch("/togglePublishStatus", verifyJWT, togglePublishStatus);

export default videoRouter;