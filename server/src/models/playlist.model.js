import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      require: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
        validate: {
          validator: (id) => {
            return mongoose.Types.ObjectId.isValid(id);
          },
          message: "Invalid Object ID(s) Provided!",
        },
      },
    ],
    isPrivate: {
      type: String,
      default: true,
    },
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);