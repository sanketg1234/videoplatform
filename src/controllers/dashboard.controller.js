import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Get channel statistics (views, subscribers, videos, likes)
const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // total videos
  const totalVideos = await Video.countDocuments({ owner: channelId });

  // total views
  const totalViewsAgg = await Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);
  const totalViews = totalViewsAgg[0]?.totalViews || 0;

  // total subscribers
  const totalSubscribers = await Subscription.countDocuments({ channel: channelId });

  // total likes on channel videos
  const channelVideoIds = await Video.find({ owner: channelId }).distinct("_id");
  const totalLikes = await Like.countDocuments({ video: { $in: channelVideoIds } });

  return res.status(200).json(
    new ApiResponse(
      200,
      { totalVideos, totalViews, totalSubscribers, totalLikes },
      "Channel stats fetched successfully"
    )
  );
});

// ✅ Get all videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const videos = await Video.find({ owner: channelId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Video.countDocuments({ owner: channelId });

  return res.status(200).json(
    new ApiResponse(
      200,
      { videos, total, page, limit },
      "Channel videos fetched successfully"
    )
  );
});

export { getChannelStats, getChannelVideos };
