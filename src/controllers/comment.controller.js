import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Get all comments for a video with pagination
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "username email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Comment.countDocuments({ video: videoId });

  return res
    .status(200)
    .json(new ApiResponse(200, { comments, total, page, limit }, "Comments fetched successfully"));
});

// ✅ Add a comment to a video
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { text } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  if (!text) {
    throw new ApiError(400, "Comment text is required");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const newComment = await Comment.create({
    text,
    video: videoId,
    owner: req.user._id, // assumes auth middleware
  });

  return res.status(201).json(new ApiResponse(201, newComment, "Comment added successfully"));
});

// ✅ Update a comment
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { text } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  if (!text) {
    throw new ApiError(400, "Updated text is required");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  comment.text = text;
  await comment.save();

  return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
});

// ✅ Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  await comment.deleteOne();

  return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
};
