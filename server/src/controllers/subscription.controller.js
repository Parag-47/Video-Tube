import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";

//Needs More Advance Pipelining

const toggleSubscription = asyncHandler(async (req, res) => {
  const channelName = req.query?.channel;
  const subscriberTo = req.user?._id;

  if (!channelName) throw new ApiError(400, "Please Provide The Channel Name");

  if (!subscriberTo) throw new ApiError(400, "Can't Find The User Id!");

  const subscriberId = await User.findById(subscriberTo);

  if (!subscriberId) throw new ApiError(400, "Can't Find The User Id!");

  const channelId = await User.findOne({ userName: channelName }).select("_id");

  if (!channelId) throw new ApiError(400, "Channel Not Found!");

  const isSubscribed = await Subscription.findOne({
    channel: channelId,
    subscriber: subscriberId,
  }).select("_id");

  if (isSubscribed) {
    const unsubscribe = await Subscription.findByIdAndDelete(isSubscribed);

    if (!unsubscribe)
      throw new ApiError(500, `Failed To Unsubscribe ${channelName}`);

    return res
      .status(200)
      .json(new ApiResponse(201, true, "Channel Unsubscribed Successfully!"));
  }

  const subscribed = await Subscription.create({
    subscriber: subscriberId,
    channel: channelId,
  });

  if (!subscribed)
    throw new ApiError(500, `Failed To Subscribe ${channelName}`);

  res
    .status(200)
    .json(new ApiResponse(201, true, "Channel Subscribed Successfully!"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) throw new ApiError(400, "User Id Not Found!");

  const channelSubscribers = await User.aggregate([
    {
      $match: {
        _id: userId,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribers",
        pipeline: [
          {
            $project: {
              channel: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribers",
    },
    {
      $addFields: {
        subscribers: "$subscribers",
      },
    },
    {
      $project: {
        subscribers: 1,
      },
    },
  ]);

  if(!channelSubscribers) throw new ApiError(500, "Couldn't Fetch The Subscribers!");

  res.status(200).json(new ApiResponse(200, true, "Successfully Fetched Subscribers List", channelSubscribers[0]));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) throw new ApiError(400, "User Id Not Found!");

  const subscribedChannels = await User.aggregate([
    {
      $match: {
        _id: userId,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribed",
        pipeline: [
          {
            $project: {
              subscriber: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribed",
    },
    {
      $addFields: {
        subscribed: "$subscribed",
      },
    },
    {
      $project: {
        subscribed: 1,
      },
    },
  ]);

  if(!subscribedChannels) throw new ApiError(500, "Couldn't Fetch The Subscribers!");

  res.status(200).json(new ApiResponse(200, true, "Successfully Fetched Subscribed Channels List", subscribedChannels[0]));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };