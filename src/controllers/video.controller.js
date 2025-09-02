import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

  const filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" }; // search by title (case-insensitive)
  }
  if (userId && isValidObjectId(userId)) {
    filter.owner = userId;
  }

  const sortOrder = sortType === "asc" ? 1 : -1;

  const videos = await Video.find(filter)
    .populate("owner", "username email")
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Video.countDocuments(filter);

  return res
    .status(200)
    .json(new ApiResponse(200, { videos, total, page, limit }, "Videos fetched successfully"));
});

// ✅ Publish a new video
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  // Files must come from middleware like multer
  const videoFile = req.files?.video?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];

  if (!videoFile) {
    throw new ApiError(400, "Video file is required");
  }

  // Upload to Cloudinary
  const videoUpload = await uploadOnCloudinary(videoFile.path, "video");
  const thumbnailUpload = thumbnailFile
    ? await uploadOnCloudinary(thumbnailFile.path, "image")
    : null;

  if (!videoUpload?.url) {
    throw new ApiError(500, "Video upload failed");
  }

  const newVideo = await Video.create({
    title,
    description,
    videoUrl: videoUpload.url,
    thumbnailUrl: thumbnailUpload?.url || "",
    owner: req.user._id, // requires auth middleware
  });

  return res.status(201).json(new ApiResponse(201, newVideo, "Video published successfully"));
});

// ✅ Get video by ID
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId).populate("owner", "username email");

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

// ✅ Update video details
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  if (title) video.title = title;
  if (description) video.description = description;

  // Update thumbnail if uploaded
  if (req.file) {
    const thumbnailUpload = await uploadOnCloudinary(req.file.path, "image");
    video.thumbnailUrl = thumbnailUpload?.url || video.thumbnailUrl;
  }

  await video.save();

  return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});

// ✅ Delete video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  await video.deleteOne();

  return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

// ✅ Toggle publish/unpublish
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to toggle publish status");
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res.status(200).json(new ApiResponse(200, video, "Publish status updated"));
});
export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}