import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { sendVerificationEmail } from '../utils/mail.js';
import jwt from "jsonwebtoken";


const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Logic to register a user
    // get user details from frontend
    //validation of user details - and all empty
    // check if user already exists in database
    // check for images and avatar
    // upload images to cloudinary and get the url
    // create user object - create user in database
    // remove password and refresh token from the response
    // check for user creation success and send response to frontend


    const body = req.body || {};
    console.log("DEBUG - Full req:", { body: req.body, headers: req.headers });
    const {username, email, fullName, password} = body;

    //console.log(email)

    if(
        [fullName, email, username, password].some((field) => !field || field.trim() === "")
        
    ){
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    let avatarUrl = "https://avatar.iran.liara.run/public";
    if (avatarLocalPath) {
        const avatar = await uploadOnCloudinary(avatarLocalPath);
        if (avatar) {
            avatarUrl = avatar.url;
        }
    }

    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    const user = await User.create({
        fullName,
        avatar: avatarUrl,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }

    // Generate Verification OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
    user.isVerified = false;
    await user.save();

    // Send OTP verification email
    await sendVerificationEmail(email, otp);

    return res.status(201).json(new ApiResponse(201, "Registration initiated. Verification OTP sent to your email.", {
        isUnverified: true,
        email: user.email,
        username: user.username
    }));
})

const loginUser = asyncHandler(async (req, res) => {
    //Ask for creds - req body -> data
    //Check if already created user exists with email or username
    //If not - throw error
    //If exists check password
    //If wrong - error
    //If correct - generate access token and refresh token
    //send cookies and response to frontend

    const body = req.body || {};
    console.log("DEBUG - Full req:", { body: req.body, headers: req.headers });
    const { email, username, password } = body;

    if (!username && !email) {
        throw new ApiError(400, "Email or username is required");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }

    // Guard unverified logins
    if (!user.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await user.save();
        await sendVerificationEmail(user.email, otp);

        return res.status(403).json(new ApiResponse(403, "Email is not verified. A verification OTP has been sent to your email.", {
            isUnverified: true,
            email: user.email
        }));
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(new ApiResponse(
        200, 
        "User logged in successfully",
        {
            user: loggedInUser,
            accessToken,
            refreshToken
        }
    ))
})

const logoutUser = asyncHandler(async(req, res)=> {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }

    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async(req,res) => {
            const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

            if (!incomingRefreshToken) {
                throw new ApiError(401, "unauthorized request")
            }

    try {
        const decodedToken = jwt.verify  (
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
         )
    
         const user = await User.findById(decodedToken?._id)
    
         if (!user) {
            throw new ApiError(401, "Invalid refresh token")
         }
    
         if (incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
         }
    
         const options = {
            httpOnly: true,
            secure: true
         }
         const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
         return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", newrefreshToken, options)
         .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newrefreshToken},
                "Access token refreshed"
            )
         )
    } catch (error) {
        throw new ApiError (401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUserProfile = asyncHandler(async(req, res) => {
    return res.status(200).json(new ApiResponse(200, "User profile fetched successfully", req.user))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName && !email) {
        throw new ApiError(400, "At least one field is required to update")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, 
        {
           $set: {
                fullName,
                email: email
           } 
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, "Account details updated successfully", user))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path;

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required");

        }

        const avatar = await uploadOnCloudinary(avatarLocalPath);

        if (!avatar.url){
            throw new ApiError(400, "Error while uploading")
        }

        const user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    avatar: avatar.url
                }
            }, 
            {
                new: true
            }
        ).select("-password -refreshToken")

        return res.status(200).json(new ApiResponse(200, "Avatar updated successfully", user))
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath){
        throw new ApiError(400, "No Cover image file provided")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url){
        throw new ApiError(400, "Error while uploading cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res.status(200).json(new ApiResponse(200, "Cover image updated successfully", user))
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "Username is required")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        }, 
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "subscribers"
                },
                subscribedToCount: {
                    $size: "subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
                    }
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    email: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscribersCount: 1,
                    subscribedToCount: 1,
                    isSubscribed: 1
                }
            }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "Channel not found")
    }

    return res.status(200).json(new ApiResponse(200, "Channel profile fetched successfully", channel[0]))
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        }, 
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchedHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerInfo",
                            pipeline: [
                                {
                                    $project: {
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $arrayElemAt: ["$ownerInfo", 0]
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, "Watch history fetched successfully", user[0]?.watchedHistory || []))
})


const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isVerified) {
        return res.status(200).json(new ApiResponse(200, null, "Email is already verified"));
    }

    if (!user.otp || !user.otpExpiry) {
        throw new ApiError(400, "No OTP request found for this user");
    }

    if (new Date() > user.otpExpiry) {
        throw new ApiError(400, "OTP has expired");
    }

    if (user.otp !== otp.trim()) {
        throw new ApiError(400, "Invalid OTP");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, "Email verified and logged in successfully", {
            user: loggedInUser,
            accessToken,
            refreshToken
        }));
});

const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isVerified) {
        return res.status(400).json(new ApiResponse(400, null, "Email is already verified"));
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    await sendVerificationEmail(user.email, otp);

    return res.status(200).json(new ApiResponse(200, "Verification OTP sent successfully", null));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUserProfile,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    verifyOTP,
    resendOTP
}
