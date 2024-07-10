import mongoose, { Schema } from "mongoose";

const commentsSchema = new Schema(
  {
    //Could Add Comment Section For Playlists But Why?
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      //require: true,
    },
    videoID: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    content: {
      type: String,
      required: true,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentsSchema);