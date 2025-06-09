import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req,_, next) => {
  try {
    const Token =
      req.cookies?.accessToken ||
      req.header("authorization")?.replace("Bearer ", "");
    if (!Token) {
      throw new ApiError(401, "Incorrect or missing token");
    }
    const decoded = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);
  
    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(404, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Unauthorized access"
    );
  }
});
