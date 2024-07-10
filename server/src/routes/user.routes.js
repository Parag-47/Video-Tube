import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updatePassword,
  updateAccountDetails,
  updateAvatarImage,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

userRouter.post("/login", loginUser);

userRouter.get("/logout", verifyJWT, logoutUser);

userRouter.get("/refreshAccessToken", refreshAccessToken);

userRouter.get("/getCurrentUser", verifyJWT, getCurrentUser);

userRouter.patch("/updatePassword", verifyJWT, updatePassword);

userRouter.patch("/updateAccountDetails", verifyJWT, updateAccountDetails);

userRouter.patch(
  "/updateAvatarImage",
  verifyJWT,
  upload.single("avatar"),
  updateAvatarImage
);

userRouter.patch(
  "/updateCoverImage",
  verifyJWT,
  upload.single("coverImage"),
  updateCoverImage
);

userRouter.get("/channelProfile", verifyJWT, getUserChannelProfile);

userRouter.get("/watchHistory", verifyJWT, getWatchHistory);

export default userRouter;
