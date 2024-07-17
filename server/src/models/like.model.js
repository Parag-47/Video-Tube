import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    likedVideoIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    dislikedVideoIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    likedPlaylistIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    dislikedPlaylistIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    likedCommentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    dislikedCommentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);