import { Video } from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if(!userId) throw new ApiError(404, "User Id Not Found!");

  const stats = await Video.aggregate([
    {
      $match: {
        owner: userId,
      }
    },
    {
      $group: {
        _id: null,
        totalVideos: {$sum: 1},
        totalViews: { $sum:"$views" },
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        pipeline: [
          {
            $match: {
              subscriber: userId,
            }
          },
        ],
        as: "totalSubscribers",
      }
    },
    {
      $lookup: {
        from: "videos",
        pipeline: [
          {
            $match: {
            owner: userId,
            }
          },
        ],
        as: "totalLikes",
      },
    },
    { $unwind: '$totalLikes' },
    {
      $lookup: {
        from: "likes",
        localField: "totalLikes._id",
        foreignField: "likedVideoIds",
        as: "totalLikes"
      }
    },
    {
      $project: {
        _id: 0,
        totalViews: 1,
        totalVideos: 1,
        totalSubscribers: { $size: "$totalSubscribers" },
        totalLikes: {$size: "$totalLikes"},
      }
    },
  ]);

  res.status(200).json(new ApiResponse(200, true, "Successfully Fetched Channel Status!", stats[0]));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if(!userId) throw new ApiError(404, "User Id Not Found!");

  const videos = await Video.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $project: {
        __v: 0,
      },
    },
  ]);

  if(!videos.length) throw new ApiError(500, "Failed To Fetch Videos!");

  res.status(200).json(new ApiResponse(200, true, "Successfully Fetched Videos!", videos));
});

export { getChannelStats, getChannelVideos };