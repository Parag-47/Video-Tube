import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    videoFile: {
      type: String,
      require: true,
    },
    title: {
      type: String,
      require: true,
      lowercase: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      require: true,
    },
    description: {
      type: String,
      lowercase: true,
      trim: true,
    },
    duration: {
      type: Number,
      require: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

videoSchema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video", videoSchema);