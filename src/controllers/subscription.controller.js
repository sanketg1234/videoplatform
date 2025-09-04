import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// Toggle subscription (subscribe/unsubscribe)
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    // Prevent subscribing to self
    if (req.user._id.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    const existingSub = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    })

    if (existingSub) {
        // Already subscribed → unsubscribe
        await Subscription.findByIdAndDelete(existingSub._id)
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Unsubscribed successfully"))
    }

    // Otherwise → subscribe
    const newSub = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
    })

    return res
        .status(201)
        .json(new ApiResponse(201, newSub, "Subscribed successfully"))
})


// Get all subscribers of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username email") // show subscriber details
        .exec()

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
})


// Get all channels a user has subscribed to
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId")
    }

    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "username email") // show channel details
        .exec()

    return res
        .status(200)
        .json(new ApiResponse(200, subscriptions, "Subscribed channels fetched successfully"))
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
