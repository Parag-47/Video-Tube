import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentsSchema = new Schema(
  {
    //Could Add Comment Section For Playlists But Why?
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      //require: true,
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    content: {
      type: String,
      required: true,
    },
    repliedToCommentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    gotRepliedFromCommentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

commentsSchema.plugin(mongooseAggregatePaginate);
export const Comment = mongoose.model("Comment", commentsSchema);