import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

//Test The Action Model!

//Add Thumbnail To Playlist.
//Optional: Restrict User From Adding Duplicate Videos And Check If The Video User Trying To Add Is Published(Visible) Or Not And Maybe Add Option To Upload Multiple Videos.
const createOrUpdatePlaylist = asyncHandler(async (req, res) => {
  const { name, description, videoId } = req.body;
  const userId = req.user?._id;

  if (!name || !videoId)
    throw new ApiError(400, "Name And Video Lists Are Required!");

  if (!userId) throw new ApiError(400, "Can't Find The User ID!");

  const isValidVideoIdArray = isValidObjectId(videoId);

  if (!isValidVideoIdArray) throw new ApiError(400, "Invalid Video Id!");

  const videoDetails = await Video.findById(videoId).select("-__v");

  if (!videoDetails) throw new ApiError(400, "Video Not Found!");

  const owner = await User.findById(userId).select("_id");

  if (!owner) throw new ApiError(400, "User Not Found!");

  let newPlaylist;

  if (!description)
    newPlaylist = new Playlist({ owner, name, videos: videoId });
  else
    newPlaylist = new Playlist({ owner, name, description, videos: videoId });

  const isNotValidPlaylist = newPlaylist.validateSync();

  if (isNotValidPlaylist)
    throw new ApiError(400, "Failed To Validate Request!", isNotValidPlaylist); //Improve Error Message.

  const playlist = await newPlaylist.save();

  //Needs Improvement!
  if (!playlist) throw new ApiError(500, "Failed To Create New Playlist!");
  //Not working don't know why -_-
  /*const POJO = JSON.parse(JSON.stringify(playlist));
  POJO.videos.pop();
  console.log("POJO: ", POJO);
  const data = POJO.videos.push(JSON.parse(JSON.stringify(videoDetails)));
  console.log("Test: ", data);*/

  res
    .status(201)
    .json(new ApiResponse(200, true, "Playlist Created Successfully!", data));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const playlists = await Playlist.find({ owner: userId }).select("-__v");

  if (!playlists) throw new ApiError(400, "No Playlists Found!");

  res
    .status(200)
    .json(
      new ApiResponse(200, true, "Playlist(s) Fetched Successfully!", playlists)
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.query;
  if (!playlistId) throw new ApiError(400, "Playlist Id Not Found!");

  const playlist = await Playlist.findById(playlistId).select("-__v");
  if (!playlist) throw new ApiError(404, "Playlist Not Found!");

  res
    .status(200)
    .json(
      new ApiResponse(200, true, "Playlist Fetched Successfully!", playlist)
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  //No Need!
});

const addRemoveVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.query;
  const userId = req.user._id;
  
  if (!playlistId || !videoId)
    throw new ApiError(400, "PlaylistID Or VideoID Not Found!");

  const playlist = await Playlist.find({
    _id: playlistId,
    owner: userId,
  }).select("-__v");
  
  if (Array.isArray(playlist) && playlist.length > 0) {
    const doesVideoExists = playlist[0].videos.includes(videoId);
    console.log("Duplicate: ", doesVideoExists);

    if (doesVideoExists) {
      //This also Works
      //playlist[0].videos.pop(videoId);
      //await playlist[0].save();

      const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlist[0]._id,
        { $pull: { videos: videoId } },
        {
          new: true,
        }
      );
      console.log("Update: ", updatedPlaylist);
      if (!updatedPlaylist)
        throw new ApiError(
          500,
          "Failed To Remove The Video From The Playlist!"
        );

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            true,
            "Video Removed From Playlist SuccessFully!",
            updatedPlaylist
          )
        );
    }

    const videoDetails = await Video.findById(videoId).select("-__v");
    if (!videoDetails) throw new ApiError(404, "Video Not Found!");

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlist[0]._id,
      { $push: { videos: videoDetails._id } },
      {
        new: true,
      }
    );

    if (!updatedPlaylist)
      throw new ApiError(500, "Failed To Add The Video To The Playlist!");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          true,
          "Video SuccessFully Added To The Playlist!",
          updatedPlaylist
        )
      );
  } else {
    throw new ApiError(404, "Playlist Not Found!");
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.query;
  
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createOrUpdatePlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  addRemoveVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
