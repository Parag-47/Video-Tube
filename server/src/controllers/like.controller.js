import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Playlist } from "../models/playlist.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

//Reduce The Amount Of DB Calls!
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.query;

  if (!videoId) throw new ApiError(400, "Video Id Not Found!");
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video Id!");

  const doesVideoExists = await Video.findById(videoId);

  if (!doesVideoExists) throw new ApiError(400, "Video Not Found!");

  const doesUserIdExists = await Like.findOne({ userId: req.user?._id });

  if (doesUserIdExists) {
    const isVideoLiked = await Like.findOne({
      userId: req.user?._id,
      likedVideoIds: videoId,
    });

    const isVideoDisliked = await Like.findOne({
      userId: req.user?._id,
      dislikedVideoIds: videoId,
    });

    if (!isVideoLiked && isVideoDisliked) {
      const removeDislike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $pull: { dislikedVideoIds: videoId } },
        { new: true }
      );

      if (!removeDislike)
        throw new ApiError(500, "Failed To Remove Dislike From The Video!");

      const addLike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $push: { likedVideoIds: videoId } },
        { new: true }
      );

      if (!addLike) throw new ApiError(500, "Failed To Add Like To The Video!");

      return res
        .status(200)
        .json(new ApiResponse(200, true, "Like Added To Video!", addLike));
    }

    if (isVideoLiked && !isVideoDisliked) {
      const removeLike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $pull: { likedVideoIds: videoId } },
        { new: true }
      );

      if (!removeLike)
        throw new ApiError(500, "Failed To Remove Like From The Video!");

      return res
        .status(200)
        .json(
          new ApiResponse(200, true, "Like Removed From Video!", removeLike)
        );
    }

    if (!isVideoLiked && !isVideoDisliked) {
      const addLike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $push: { likedVideoIds: videoId } },
        { new: true }
      );

      if (!addLike) throw new ApiError(500, "Failed To Add Like To The Video!");

      return res
        .status(200)
        .json(new ApiResponse(200, true, "Like Added To Video!", addLike));
    }
  }

  const addLike = await Like.create({
    userId: req.user?._id,
    likedVideoIds: videoId,
  });

  if (!addLike) throw new ApiError(500, "Failed To Add Like To The Video");
  res
    .status(200)
    .json(new ApiResponse(200, true, "Like Added To Video!", addLike));
});

const toggleVideoDislike = asyncHandler(async (req, res) => {
  const { videoId } = req.query;

  if (!videoId) throw new ApiError(400, "Video Id Not Found!");
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video Id!");

  const doesVideoExists = await Video.findById(videoId);

  if (!doesVideoExists) throw new ApiError(400, "Video Not Found!");

  const doesUserIdExists = await Like.findOne({ userId: req.user?._id });

  if (doesUserIdExists) {
    const isVideoLiked = await Like.findOne({
      userId: req.user?._id,
      likedVideoIds: videoId,
    });

    const isVideoDisliked = await Like.findOne({
      userId: req.user?._id,
      dislikedVideoIds: videoId,
    });

    if (isVideoLiked && !isVideoDisliked) {
      const removeLike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $pull: { likedVideoIds: videoId } },
        { new: true }
      );

      if (!removeLike)
        throw new ApiError(500, "Failed To Remove Like From The Video!");

      const addDislike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $push: { dislikedVideoIds: videoId } },
        { new: true }
      );

      if (!addDislike)
        throw new ApiError(500, "Failed To Add Dislike To The Video!");

      return res
        .status(200)
        .json(
          new ApiResponse(200, true, "Dislike Added To Video!", addDislike)
        );
    }

    if (!isVideoLiked && isVideoDisliked) {
      const removeDislike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $pull: { dislikedVideoIds: videoId } },
        { new: true }
      );

      if (!removeDislike)
        throw new ApiError(500, "Failed To Remove Dislike From The Video!");

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            true,
            "Dislike Removed From Video!",
            removeDislike
          )
        );
    }

    if (!isVideoLiked && !isVideoDisliked) {
      const addDislike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $push: { dislikedVideoIds: videoId } },
        { new: true }
      );

      if (!addDislike)
        throw new ApiError(500, "Failed To Add Dislike To The Video!");

      return res
        .status(200)
        .json(
          new ApiResponse(200, true, "Dislike Added To Video!", addDislike)
        );
    }
  }

  const addDislike = await Like.create({
    userId: req.user?._id,
    dislikedVideoIds: videoId,
  });

  if (!addDislike)
    throw new ApiError(500, "Failed To Add Dislike To The Video!");

  res
    .status(200)
    .json(new ApiResponse(200, true, "Dislike Added To Video!", addDislike));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.query;

  if (!commentId) throw new ApiError(400, "Comment Id Not Found!");
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid Comment Id!");

  const doesCommentExists = await Comment.findById(commentId);

  if (!doesCommentExists) throw new ApiError(400, "Comment Not Found!");

  const doesUserIdExists = await Like.findOne({ userId: req.user?._id });

  if (doesUserIdExists) {
    const isCommentLiked = await Like.findOne({
      userId: req.user?._id,
      likedCommentIds: commentId,
    });

    const isCommentDisliked = await Like.findOne({
      userId: req.user?._id,
      dislikedCommentIds: commentId,
    });

    if (!isCommentLiked && isCommentDisliked) {
      const removeDislike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $pull: { dislikedCommentIds: commentId } },
        { new: true }
      );

      if (!removeDislike)
        throw new ApiError(500, "Failed To Remove Dislike From The Comment!");

      const addLike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $push: { likedCommentIds: commentId } },
        { new: true }
      );

      if (!addLike)
        throw new ApiError(500, "Failed To Add Like To The Comment!");

      return res
        .status(200)
        .json(new ApiResponse(200, true, "Like Added To Comment!", addLike));
    }

    if (isCommentLiked && !isCommentDisliked) {
      const removeLike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $pull: { likedCommentIds: commentId } },
        { new: true }
      );

      if (!removeLike)
        throw new ApiError(500, "Failed To Remove Like From The Comment!");

      return res
        .status(200)
        .json(
          new ApiResponse(200, true, "Like Removed From Comment!", removeLike)
        );
    }

    if (!isCommentLiked && !isCommentDisliked) {
      const addLike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $push: { likedCommentIds: commentId } },
        { new: true }
      );

      if (!addLike)
        throw new ApiError(500, "Failed To Add Like To The Comment!");

      return res
        .status(200)
        .json(new ApiResponse(200, true, "Like Added To Comment!", addLike));
    }
  }

  const addLike = await Like.create({
    userId: req.user?._id,
    likedCommentIds: commentId,
  });
  if (!addLike) throw new ApiError(500, "Failed To Add Like To The Comment");
  res
    .status(200)
    .json(new ApiResponse(200, true, "Like Added To Comment!", addLike));
});

const toggleCommentDislike = asyncHandler(async (req, res) => {
  const { commentId } = req.query;

  if (!commentId) throw new ApiError(400, "Comment Id Not Found!");
  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid Comment Id!");

  const doesCommentExists = await Comment.findById(commentId);

  if (!doesCommentExists) throw new ApiError(400, "Comment Not Found!");

  const doesUserIdExists = await Like.findOne({ userId: req.user?._id });

  if (doesUserIdExists) {
    const isCommentLiked = await Like.findOne({
      userId: req.user?._id,
      likedCommentIds: commentId,
    });

    const isCommentDisliked = await Like.findOne({
      userId: req.user?._id,
      dislikedCommentIds: commentId,
    });

    if (isCommentLiked && !isCommentDisliked) {
      const removeLike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $pull: { likedCommentIds: commentId } },
        { new: true }
      );

      if (!removeLike)
        throw new ApiError(500, "Failed To Remove Like From The Comment!");

      const addDislike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $push: { dislikedCommentIds: commentId } },
        { new: true }
      );

      if (!addDislike)
        throw new ApiError(500, "Failed To Add Dislike To The Comment!");

      return res
        .status(200)
        .json(
          new ApiResponse(200, true, "Dislike Added To Comment!", addDislike)
        );
    }

    if (!isCommentLiked && isCommentDisliked) {
      const removeDislike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $pull: { dislikedCommentIds: commentId } },
        { new: true }
      );

      if (!removeDislike)
        throw new ApiError(500, "Failed To Remove Dislike From The Comment!");

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            true,
            "Dislike Removed From Comment!",
            removeDislike
          )
        );
    }

    if (!isCommentLiked && !isCommentDisliked) {
      const addDislike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $push: { dislikedCommentIds: commentId } },
        { new: true }
      );

      if (!addDislike)
        throw new ApiError(500, "Failed To Add Dislike To The Comment!");

      return res
        .status(200)
        .json(
          new ApiResponse(200, true, "Dislike Added To Comment!", addDislike)
        );
    }
  }

  const addDislike = await Like.create({
    userId: req.user?._id,
    dislikedCommentIds: commentId,
  });
  if (!addDislike)
    throw new ApiError(500, "Failed To Add Dislike To The Comment!");
  res
    .status(200)
    .json(new ApiResponse(200, true, "Dislike Added To Comment!", addDislike));
});

const togglePlaylistLike = asyncHandler(async (req, res) => {
  const { playlistId } = req.query;

  if (!playlistId) throw new ApiError(400, "Playlist Id Not Found!");
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid Playlist Id!");

  const doesPlaylistExists = await Playlist.findById(playlistId);

  if (!doesPlaylistExists) throw new ApiError(400, "Playlist Not Found!");

  const doesUserIdExists = await Like.findOne({ userId: req.user?._id });

  if (doesUserIdExists) {
    const isPlaylistLiked = await Like.findOne({
      userId: req.user?._id,
      likedPlaylistIds: playlistId,
    });

    const isPlaylistDisliked = await Like.findOne({
      userId: req.user?._id,
      dislikedPlaylistIds: playlistId,
    });

    if (!isPlaylistLiked && isPlaylistDisliked) {
      const removeDislike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $pull: { dislikedPlaylistIds: playlistId } },
        { new: true }
      );

      if (!removeDislike)
        throw new ApiError(500, "Failed To Remove Dislike From The Playlist!");

      const addLike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $push: { likedPlaylistIds: playlistId } },
        { new: true }
      );

      if (!addLike)
        throw new ApiError(500, "Failed To Add Like To The Playlist!");

      return res
        .status(200)
        .json(new ApiResponse(200, true, "Like Added To Playlist!", addLike));
    }

    if (isPlaylistLiked && !isPlaylistDisliked) {
      const removeLike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $pull: { likedPlaylistIds: playlistId } },
        { new: true }
      );

      if (!removeLike)
        throw new ApiError(500, "Failed To Remove Like From The Playlist!");

      return res
        .status(200)
        .json(
          new ApiResponse(200, true, "Like Removed From Playlist!", removeLike)
        );
    }

    if (!isPlaylistLiked && !isPlaylistDisliked) {
      const addLike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $push: { likedPlaylistIds: playlistId } },
        { new: true }
      );

      if (!addLike)
        throw new ApiError(500, "Failed To Add Like To The Playlist!");

      return res
        .status(200)
        .json(new ApiResponse(200, true, "Like Added To Playlist!", addLike));
    }
  }

  const addLike = await Like.create({
    userId: req.user?._id,
    likedPlaylistIds: playlistId,
  });
  if (!addLike) throw new ApiError(500, "Failed To Add Like To The Playlist");
  res
    .status(200)
    .json(new ApiResponse(200, true, "Like Added To Playlist!", addLike));
});

const togglePlaylistDislike = asyncHandler(async (req, res) => {
  const { playlistId } = req.query;

  if (!playlistId) throw new ApiError(400, "Playlist Id Not Found!");
  if (!isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid Playlist Id!");

  const doesPlaylistExists = await Playlist.findById(playlistId);

  if (!doesPlaylistExists) throw new ApiError(400, "Playlist Not Found!");

  const doesUserIdExists = await Like.findOne({ userId: req.user?._id });

  if (doesUserIdExists) {
    const isPlaylistLiked = await Like.findOne({
      userId: req.user?._id,
      likedPlaylistIds: playlistId,
    });

    const isVideoDisliked = await Like.findOne({
      userId: req.user?._id,
      dislikedPlaylistIds: playlistId,
    });

    if (isPlaylistLiked && !isVideoDisliked) {
      const removeLike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $pull: { likedPlaylistIds: playlistId } },
        { new: true }
      );

      if (!removeLike)
        throw new ApiError(500, "Failed To Remove Like From The Playlist!");

      const addDislike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $push: { dislikedPlaylistIds: playlistId } },
        { new: true }
      );

      if (!addDislike)
        throw new ApiError(500, "Failed To Add Dislike To The Playlist!");

      return res
        .status(200)
        .json(
          new ApiResponse(200, true, "Dislike Added To Playlist!", addDislike)
        );
    }

    if (!isPlaylistLiked && isVideoDisliked) {
      const removeDislike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $pull: { dislikedPlaylistIds: playlistId } },
        { new: true }
      );

      if (!removeDislike)
        throw new ApiError(500, "Failed To Remove Dislike From The Playlist!");

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            true,
            "Dislike Removed From Playlist!",
            removeDislike
          )
        );
    }

    if (!isPlaylistLiked && !isVideoDisliked) {
      const addDislike = await Like.findOneAndUpdate(
        { userId: req.user?._id },
        { $push: { dislikedPlaylistIds: playlistId } },
        { new: true }
      );

      if (!addDislike)
        throw new ApiError(500, "Failed To Add Dislike To The Playlist!");

      return res
        .status(200)
        .json(
          new ApiResponse(200, true, "Dislike Added To Playlist!", addDislike)
        );
    }
  }

  const addDislike = await Like.create({
    userId: req.user?._id,
    dislikedPlaylistIds: playlistId,
  });
  if (!addDislike)
    throw new ApiError(500, "Failed To Add Dislike To The Playlist!");
  res
    .status(200)
    .json(new ApiResponse(200, true, "Dislike Added To Playlist!", addDislike));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $lookup: {
        from: "videos",
        let: { likedVideos: "$likedVideoIds" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$_id", "$$likedVideos"] },
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
          {
            $project: {
              __v: 0,
            },
          },
        ],
        as: "likedVideos",
      },
    },
    {
      $project: {
        likedVideoIds: 0,
        dislikedVideoIds: 0,
        likedPlaylistIds: 0,
        dislikedPlaylistIds: 0,
        likedCommentIds: 0,
        dislikedCommentIds: 0,
        __v: 0,
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, true, "OK!", likedVideos));
});

export {
  toggleVideoLike,
  toggleVideoDislike,
  toggleCommentLike,
  toggleCommentDislike,
  togglePlaylistLike,
  togglePlaylistDislike,
  getLikedVideos,
};