import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";

// Create new video
export const createVideo = asyncHandler(async (req, res) => {
    const { title, description, category, channel, channelHandle, channelAvatarColor, owner } = req.body;

    if (!title || !channel || !channelHandle) {
        if (req.file) fs.unlinkSync(req.file.path);
        throw new ApiError(400, 'Title, channel, and channelHandle are required');
    }

    if (!req.file) {
        throw new ApiError(400, 'Video file is required');
    }

    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (!uploadResult) {
        throw new ApiError(500, 'Failed to upload video to Cloudinary');
    }

    const colors = [
        '#ff4e50', '#f9d423', '#e1eec3', '#f05053', '#e15f41', 
        '#c44569', '#574b90', '#3dc1d3', '#f78fb3', '#cf6a87', 
        '#546de5', '#e15f41', '#f8a5c2', '#f5cd79', '#63cdda', 
        '#778beb', '#786fa6'
    ];
    const color1 = colors[Math.floor(Math.random() * colors.length)];
    const color2 = colors[Math.floor(Math.random() * colors.length)];
    const thumbnailGradient = [color1, color2];

    const durationSecs = uploadResult.duration || 0;
    const min = Math.floor(durationSecs / 60);
    const sec = Math.floor(durationSecs % 60).toString().padStart(2, '0');
    const duration = `${min}:${sec}`;

    const video = await Video.create({
        title,
        description,
        category: category || 'All',
        channel,
        channelHandle,
        channelAvatarColor: channelAvatarColor || '#6366f1',
        thumbnailGradient,
        duration,
        videoUrl: uploadResult.secure_url,
        owner: owner || channelHandle,
        views: 0,
        likes: 0,
        dislikes: 0,
        uploadedAt: new Date()
    });

    return res.status(201).json(video);
});

// Delete a video
export const deleteVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const video = await Video.findById(id);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    await Video.findByIdAndDelete(id);
    return res.status(200).json(new ApiResponse(200, {}, 'Video deleted successfully'));
});

// Like a video
export const likeVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const video = await Video.findByIdAndUpdate(
        id,
        { $inc: { likes: 1 } },
        { new: true }
    );
    
    if (!video) throw new ApiError(404, 'Video not found');
    return res.status(200).json(video);
});

// Unlike a video
export const unlikeVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const video = await Video.findByIdAndUpdate(
        id,
        { $inc: { likes: -1 } },
        { new: true }
    );
    
    if (!video) throw new ApiError(404, 'Video not found');
    return res.status(200).json(video);
});

// Get all videos (with category filter)
export const getVideos = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const filter = category && category !== 'All' ? { category } : {};
    
    const videos = await Video.find(filter).sort({ uploadedAt: -1 });
    return res.status(200).json(videos);
});

// Get video by ID
export const getVideoById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    
    if (!video) throw new ApiError(404, 'Video not found');
    return res.status(200).json(video);
});

// Search videos
export const searchVideos = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);
    
    const results = await Video.find(
        { $text: { $search: q } },
        { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
    
    return res.status(200).json(results);
});

// Get categories
export const getCategories = asyncHandler(async (req, res) => {
    const cats = ['All', 'Gaming', 'Music', 'Tech', 'Science', 'Sports', 'Comedy', 'News', 'Education', 'Film', 'Other'];
    return res.status(200).json(cats);
});
