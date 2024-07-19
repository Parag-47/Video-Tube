import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId, page = 1, limit = 10 } = req.query;

  const options = {
    page,
    limit,
  };

  if(!videoId) throw new ApiError(400, "Video Id Required!");
  
  const getComments = await Comment.aggregatePaginate(Comment.aggregate([
    {
      $match: {
        videoId: mongoose.Types.ObjectId.createFromHexString(videoId),
      }
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
              userName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "gotRepliedFromCommentIds",
        foreignField: "_id",
        as: "gotRepliedFromCommentIds",
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
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            }
          },
          {
            $project: {
              __v: 0,
              repliedToCommentId: 0,
            },
          },
        ]
      }
    },
    {
      $project: {
        __v: 0,
      },
    },
  ]), options);
  
  if(!getComments) return res.status(200).json(new ApiResponse(204, true, "No Comments Found!"));

  res.status(200).json(new ApiResponse(200, true, "Comments Fetched Successfully!", getComments.docs));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId, content } = req.body;
  const userId = req.user?._id;

  if (!videoId || !content.trim())
    throw new ApiError(400, "VideoId Or Content Not Found!");

  const doesVideoExists = await Video.findById(videoId);

  if (!doesVideoExists) throw new ApiError(404, "Video Not Found!");

  const comment = await Comment.create({
    owner: userId,
    videoId,
    content,
  });

  res
    .status(201)
    .json(new ApiResponse(201, true, "Comment Added Successfully!", comment));
});

const reply = asyncHandler(async (req, res) => {
  const {commentId, content} = req.body;
  const userId = req.user?._id;

  if(!commentId || !content.trim()) throw new ApiError(400, "Comment Id Or Content Not Found!");

  const repliedCommentId = await Comment.findById(commentId);

  if(!repliedCommentId) throw new ApiError(404, "Comment Not Found!");
  
  const createReply = await Comment.create({
    owner: userId,
    content,
    repliedToCommentId: commentId,
  });

  if(!createReply) throw new ApiError(500, "Failed To Create Replay!");

  const addReplay = await Comment.findByIdAndUpdate(commentId, {
    $push: { gotRepliedFromCommentIds: createReply._id }
  }, {new: true}).populate("gotRepliedFromCommentIds").select("-__v");

  if(!addReplay) throw new ApiError(500, "Failed To Add Replay!");

  res.status(200).json(new ApiResponse(200, true, "Replay Added Successfully!", addReplay));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId, content } = req.body;
  const userId = req.user?._id;

  if (!commentId || !content.trim()) throw new ApiError(400, "Comment Id Not Found!");

  const isCommentIdValid = await Comment.findById(commentId, { owner: userId });

  if (!isCommentIdValid) throw new ApiError(404, "Comment Not Found!");

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content: content },
    { new: true }
  ).select("-__v");

  if (!updatedComment) throw new ApiError(500, "Failed To Update The Comment!");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        true,
        "Comment Updated Successfully!",
        updatedComment
      )
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.query;
  const userId = req.user?._id;

  if (!commentId) throw new ApiError(400, "Comment Id Not Found!");

  const isCommentIdValid = await Comment.findById(commentId, null, { owner: userId });
  
  if (!isCommentIdValid) throw new ApiError(404, "Comment Not Found!");

  const isNestedReply = await Comment.findOne({gotRepliedFromCommentIds: commentId});
  
  if(isNestedReply) {
    const removeReference= await Comment.findByIdAndUpdate(isNestedReply._id, {$pull: {gotRepliedFromCommentIds: commentId}});
    
    if(!removeReference) throw new ApiError(500, "Failed To Delete All The References!");
  }

  //const deleteReplies = 
  await Comment.deleteMany({_id:{ $in: isCommentIdValid.gotRepliedFromCommentIds }});
  
  const deletedComment = await Comment.findByIdAndDelete(commentId).select("-__v");

  if (!deletedComment) throw new ApiError(500, "Failed To Delete The Comment!");

  res.status(204).send();
});

export { getVideoComments, addComment, reply, updateComment, deleteComment };