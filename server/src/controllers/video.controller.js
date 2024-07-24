import mongoose, { isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { fileUploader, fileDeleter } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";

//Not Complete Yet!
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortBy, sortType } = req.query;

  const options = {
    page: page,
    limit: limit,
    sort: sortBy,
    sortType: sortType,
  };

  const data = await Video.aggregatePaginate(Video.aggregate(), options);

  if (!data) throw new ApiError(500, "FailedTo Fetch Videos!");

  res.status(200).json(new ApiResponse(200, true, "OK", data.docs));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.query;
  console.log("VideoId: ", videoId);
  if (!videoId) throw new ApiError(200, "Couldn't Find Video ID!");

  const videoDetails = await Video.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId.createFromHexString(videoId),
      },
    },
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
              coverImage: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (!videoDetails) throw new ApiError(500, "Failed To Fetch The Video!");

  if (videoDetails.isPublished === false)
    throw new ApiError(404, "No video Found!");

  res
    .status(200)
    .json(
      new ApiResponse(200, true, "Video Fetched Successfully!", videoDetails)
    );
});

//Seems A Bit Hacky The Way Images And Videos Are Uploaded!
const videoUpload = asyncHandler(async (req, res) => {
  const isVideoOrThumbnail = true;
  const title = req.body.title;
  const isPublished = req.body.isPublished || false;
  const description = req.body.description || "";

  if (!title) throw new ApiError(400, "Video Tittle Is Required!");

  const user = await User.findById(req.user?._id);

  if (!user) throw new ApiError(400, "User Id Not Found!");

  let videoFilePath;
  let thumbnailFilePath;

  if (req.files && Array.isArray(req.files.video) && req.files.video.length > 0)
    videoFilePath = req.files.video[0].path;
  else throw new ApiError(400, "Video File Not Found!");

  if (
    req.files &&
    Array.isArray(req.files?.thumbnail) &&
    req.files.thumbnail.length > 0
  )
    thumbnailFilePath = req.files.thumbnail[0].path;
  else thumbnailFilePath = null;

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

  const videoDetails = await fileUploader(
    user.userName,
    user.userName + "_video-" + uniqueSuffix,
    videoFilePath,
    isVideoOrThumbnail
  );

  //console.log("Video: ", videoDetails);

  if (!videoDetails)
    throw new ApiError(400, "Something Went Wrong While Uploading Files!");

  //Can Also Be Done Like This :)
  /*const thumbnailDetails = thumbnailFilePath 
    ? await fileUploader(user.userName, user.userName+"_DemoThumbnail", thumbnailFilePath)
    .catch((error)=>{ throw new ApiError(400, "Please Provide A Thumbnail!", error);})
    : { url: "" }*/

  //More Readable I Guess :|
  let thumbnailDetails;
  if (thumbnailFilePath) {
    thumbnailDetails = await fileUploader(
      user.userName,
      user.userName + "_thumbnail-" + uniqueSuffix,
      thumbnailFilePath,
      isVideoOrThumbnail
    );

    if (!thumbnailDetails)
      throw new ApiError(400, "Something Went Wrong While Uploading Files!");
  } else {
    thumbnailDetails = { url: null };
  }
  //console.log("thumbnail: ", thumbnailDetails);
  const data = await Video.create({
    owner: user._id,
    videoFile: videoDetails.url,
    title: title,
    thumbnail: thumbnailDetails.url,
    description: description,
    duration: videoDetails.duration,
    isPublished: isPublished,
  });

  //console.log("Data: ", data);

  if (!data) throw new ApiError(500, "Something Went Wrong!");

  res
    .status(200)
    .json(new ApiResponse(200, "Video Uploaded Successfully!", data));
});

const videoUpdate = asyncHandler(async (req, res) => {
  const isVideoOrThumbnail = true;
  const title = req.body.title;
  const isPublished = req.body.isPublished || false;
  const description = req.body.description || "";
  const videoId = req.body.videoId;

  if (!title) throw new ApiError(400, "Video Tittle Is Required!");

  if (!videoId) throw new ApiError(400, "Video ID Is Required!");

  const user = await User.findById(req.user?._id).select("_id userName");

  if (!user) throw new ApiError(400, "User Id Not Found!");

  if(!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video Id");

  const videoDetails = await Video.findById(videoId);

  if (!videoDetails) throw new ApiError(400, "Invalid Video Id!");

  if (JSON.stringify(user._id) !== JSON.stringify(videoDetails.owner))
    throw new ApiError(401, "Not Authorized!");

  const thumbnailFilePath = req.file?.path || null;

  if (videoDetails.thumbnail && thumbnailFilePath) {
    const deletedOldThumbnail = await fileDeleter(
      null,
      videoDetails.thumbnail,
      null,
      thumbnailFilePath
    );
    if (!deletedOldThumbnail)
      throw new ApiError(500, "Failed To Remove The Old Thumbnail!");
  }

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

  let thumbnailDetails;

  if (thumbnailFilePath) {
    thumbnailDetails = await fileUploader(
      user.userName,
      user.userName + "_thumbnail-" + uniqueSuffix,
      thumbnailFilePath,
      isVideoOrThumbnail
    );

    if (!thumbnailDetails)
      throw new ApiError(400, "Something Went Wrong While Uploading Files!");
    videoDetails.thumbnail = thumbnailDetails.url;
  } else {
    thumbnailDetails = { url: null };
  }

  const updatedVideo = await Video.findByIdAndUpdate(videoDetails._id, {
    title,
    isPublished,
    description,
    thumbnail: videoDetails.thumbnail,
  }).select("-owner");

  if (!updatedVideo)
    throw new ApiError(500, "Something Went Wrong While Updating!");
  res
    .status(200)
    .json(new ApiResponse(200, "Video Details Updated Successfully!"));
});

//When The Video Is Deleted All It's Comments And Likes Should Also Be Deleted*
const videoDelete = asyncHandler(async (req, res) => {
  const id = await User.findById(req.user?._id).select("_id");

  if (!id) throw new ApiError(400, "Can't Find The User!");

  const videoDetails = await Video.findOne({ owner: id });

  if (!videoDetails) throw new ApiError(500, "Can't Find The File!");

  //Deletes All The Comments And Replies And There Likes/Dislikes Of The Video!
  const comments = await Comment.aggregate([
    {
      $match: {
        videoId: videoDetails._id, 
      }
    },
    {
      $lookup: {
        from: "comments",
        localField: "gotRepliedFromCommentIds",
        foreignField: "_id",
        as: "replies",
        pipeline: [
          {
            $project: {
              _id: 1,
              replies: 1,
            }
          }
        ]
      }
    },
    {
      $project: {
        _id: 1,
        replies: 1,
      }
    },
  ]);

  let commentIds = [];
  let repliesIds = [];
  let k = 0;

  for(let i = 0; i<comments.length; i++) {
    commentIds[i] = comments[i]?._id;
    for(let j = 0; j<comments[i].replies.length; j++) {
      repliesIds[k] = comments[i]?.replies[j]?._id;
      k++;
    }
  }

  const commentIdsForDeletion = commentIds.concat(repliesIds);

  //Delete Likes And Dislikes Of The Comments!
  await Like.updateMany({$pull: {likedCommentIds: {$in: commentIdsForDeletion}}});
  await Like.updateMany({$pull: {dislikedCommentIds: {$in: commentIdsForDeletion}}});

  //Delete All The Comments!
  await Comment.deleteMany({_id:{ $in: commentIdsForDeletion }});

  //Deletes All The Likes And Dislikes On The Video!
  await Like.updateMany({$pull: {likedVideoIds: videoDetails._id}});
  await Like.updateMany({$pull: {dislikedVideoIds: videoDetails._id}});
  
  //Deletes The Video File And Thumbnail From Cloudinary!
  const deleted = await fileDeleter(
    videoDetails.videoFile,
    videoDetails.thumbnail,
    videoFilePath,
    thumbnailFilePath
  );

  if (!deleted || deleted === false)
    throw new ApiError(500, "Something Went Wrong While Deleting Video File!");

  const deletedVideo = await Video.findByIdAndDelete(videoDetails._id);
  
  if(!deletedVideo) throw new ApiError(500, "Failed To Delete the Video!");

  res.status(200).json(new ApiResponse(200, "Video Deleted Successfully!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.query;

  if (!videoId) throw new ApiError(200, "Couldn't Find Video ID!");

  if(!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video Id");

  const videoDetails = await Video.findById(videoId).select("_id isPublished");

  if (!videoDetails) throw new ApiError(404, "Video Not Found!");

  if (videoDetails.isPublished) {
    const unpublished = await Video.findByIdAndUpdate(videoDetails._id, {
      isPublished: false,
    });
    if (!unpublished) throw new ApiError(500, "Failed To Unpublish Video!");
    res
      .status(200)
      .json(new ApiResponse(200, true, "Video Unpublished Successfully!"));
  } else {
    const Published = await Video.findByIdAndUpdate(videoDetails._id, {
      isPublished: true,
    });
    if (!Published) throw new ApiError(500, "Failed To Publish Video!");
    res
      .status(200)
      .json(new ApiResponse(200, true, "Video Published Successfully!"));
  }
});

export {
  getAllVideos,
  getVideoById,
  videoUpload,
  videoDelete,
  videoUpdate,
  togglePublishStatus,
};