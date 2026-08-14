import { Channel } from "../models/channel.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all channels
export const getChannels = asyncHandler(async (req, res) => {
    const channels = await Channel.find();
    return res.status(200).json(channels);
});
