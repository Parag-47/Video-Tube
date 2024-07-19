import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { fileUploader } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

async function generateAccessAndRefreshTokens(userId) {
  const user = await User.findById(userId);

  try {
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    //const result = await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findByIdAndUpdate(userId, {
      $set: { refreshToken },
    }).select("-password -refreshToken -__v");

    //Didn't worked for some reason
    //delete user.password;
    //delete user.__v;
    //delete user.refreshToken;

    return { accessToken, refreshToken, loggedInUser };
  } catch (error) {
    console.error("Error while generating tokens, Error: ", error);
    throw new ApiError(500, "Something Went Wrong While Generating Tokens!");
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password, fullName } = req.body;

  if (!userName || !email || !password || !fullName) {
    console.error(
      "Error: Got Missing Fields From The User While Registering New User!"
    );
    throw new ApiError(400, "All fields are required!");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  }).catch((error) => {
    console.error("Error while checking if user already exists: ", error);
  });

  //console.log("ExistedUser: ", existedUser);

  //Doesn't Work
  //const avatarPath = req.files?.avatar[0]?.path;
  //const coverImagePath = req.files?.coverImage[0]?.path;

  let avatarPath;
  let coverImagePath;

  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  )
    avatarPath = req.files.avatar[0].path;
  else throw new ApiError(401, "Please Provide An Avatar Image!");

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  )
    coverImagePath = req.files.coverImage[0].path;
  else coverImagePath = null;

  if (existedUser)
    throw new ApiError(
      409,
      "User With This Email ID or Username Already Exists!"
    );

  const avatarImage = await fileUploader(
    userName,
    userName + "_avatarImage",
    avatarPath
  );
  //console.log("File Upload Result: ",avatarImg);

    if (!avatarImage) throw new ApiError(401, "Please Provide An Avatar Image!");

  //const coverImg = await fileUploader(userName+"_coverImage", coverImagePath);
  //console.log("File Upload Result: ", coverImage);

  const coverImage = coverImagePath
    ? await fileUploader(userName, userName + "_coverImage", coverImagePath)
    .catch((error) => {throw new ApiError(401, "Please Provide An Cover Image!", error);})
    : { url: "" };

  const user = await User.create({
    userName,
    email,
    password,
    fullName,
    avatar: avatarImage.url,
    coverImage: coverImage.url,
  });

  //console.log("Created User: ", user);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -__v"
  );

  if (!createdUser) {
    console.log("Something Went Wrong While Registering New User!");
    throw new ApiError(500, "Something Went Wrong While Registering New User!");
  }

  //console.log("Created User: ", createdUser);

  const response = new ApiResponse(
    200,
    true,
    "User Registered Successfully!",
    createdUser
  );
  res.status(201).json(response);
});

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  if (!(userName || email))
    throw new ApiError(400, "Username or Email Id is Required!");

  if (!password) throw new ApiError(400, "Password is Required!");

  const user = await User.findOne({ $or: [{ userName }, { email }] });

  if (!user) throw new ApiError(404, "User doesn't exist!");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(400, "Incorrect Password!");

  const cookieData = await generateAccessAndRefreshTokens(user._id);

  //console.log("Cookie Data: ", cookieData.user);

  res
    .status(200)
    .cookie("accessToken", cookieData.accessToken, cookieOptions)
    .cookie("refreshToken", cookieData.refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, true, "User Logged In Successfully!", cookieData)
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const response = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    }
  );

  res
    .status(301)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .redirect("/");
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(200, true, "Access Token Refreshed", {
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    console.log("Error while refreshing tokens!: ", error);
    throw new ApiError(401, "Something Went Wrong While Refreshing Tokens!");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, true, "User Fetched Successfully!", req?.user));
});

const updatePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  if ((!oldPassword, !newPassword, !confirmPassword))
    throw new ApiError(400, "Please Provide All The Passwords!");

  if (newPassword !== confirmPassword)
    throw new ApiError(400, "New Password And Confirm Password Didn't Match!");

  const user = await User.findById(req.user?._id);

  if (!user) throw new ApiError(400, "Can't Find The User!");

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) throw new ApiError(400, "Old Password Didn't Match!");

  const isOldAndNewPasswordSame = await user.isPasswordCorrect(newPassword);

  if (isOldAndNewPasswordSame)
    throw new ApiError(400, "Old And New Password Can't Be The Same!");

  user.password = newPassword;
  const updatedUser = await user.save({ validateBeforeSave: false });

  if (!updatedUser)
    throw new ApiError(500, "Something Went Wrong While Updating Password!");

  res
    .status(200)
    .json(new ApiResponse(200, true, "Password Updated Successfully!"));
});
//Check If The Email Is Already In Use!
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { userName, email, fullName } = req.body;

  if (
    !userName.toLowerCase() ||
    !email.toLowerCase() ||
    !fullName.toLowerCase()
  )
    throw new ApiError(400, "All Fields Are Required!");

  const isUserNameTaken = await User.findOne({ userName });

  if (isUserNameTaken) throw new ApiError(400, "This Username Is Taken!");

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        userName,
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken -__v");

  if (!user) throw new ApiError(500, "Can't Find The User!");

  res
    .status(200)
    .json(
      new ApiResponse(200, true, "User Details Updated Successfully!", user)
    );
});

const updateAvatarImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) throw new ApiError(500, "Can't Find The User!");

  const avatarPath = req.file?.path;

  if (!avatarPath) throw new ApiError(400, "Please Provide An Avatar Image!");

  const avatarImage = await fileUploader(
    user.userName,
    user.userName + "_avatarImage",
    avatarPath
  );

  if (!avatarImage.url)
    throw new ApiError(500, "Something Went Wrong While Uploading Images!");

  const newUser = await User.findByIdAndUpdate(
    user._id,
    { $set: { avatar: avatarImage.url } },
    { new: true }
  ).select("-password -refreshToken -__v");

  if (!newUser)
    throw new ApiError(500, "Something Went Wrong While Updating The User!");

  res
    .status(200)
    .json(
      new ApiResponse(200, true, "Avatar Image Updated Successfully!", newUser)
    );
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);

  if (!user) throw new ApiError(500, "Can't Find The User!");

  const coverImagePath = req.file?.path;

  if (!coverImagePath)
    throw new ApiError(400, "Please Provide An Cover Image!");

  const coverImage = await fileUploader(
    user.userName,
    user.userName + "_coverImage",
    coverImagePath
  );

  if (!coverImage.url)
    throw new ApiError(500, "Something Went Wrong While Uploading Images!");

  const newUser = await User.findByIdAndUpdate(
    user._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password -refreshToken -__v");

  if (!newUser)
    throw new ApiError(500, "Something Went Wrong While Updating The User!");

  res
    .status(200)
    .json(
      new ApiResponse(200, true, "Cover Image Updated Successfully!", newUser)
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const  channelName  = req.query.channel;

  if (!channelName?.trim().toLowerCase())
    throw new ApiError(400, "Username Is Missing!");

  const channel = await User.aggregate([
    {
      $match: {
        userName: channelName,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribed",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribedCount: {
          $size: "$subscribed",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        email: 1,
        userName: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        subscribedCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel.length) throw new ApiError(400, "Channel Doesn't Exists!");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        true,
        "Channel Details Fetched Successfully!",
        channel[0]
      )
    );
});

const getWatchHistory = asyncHandler(async (req,res)=>{
  const user = await User.aggregate([
    {
      $match: { 
       _id: mongoose.Types.ObjectId.createFromHexString(req.user._id),
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory" ,
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        }
      }
    }
  ]);

  if(!user)
    throw new ApiError(500, "Couldn't Fetch Watch History!");

  res.status(200).json(new ApiResponse(200, true, "Watch History Fetched Successfully!", user));
});

export {
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
};