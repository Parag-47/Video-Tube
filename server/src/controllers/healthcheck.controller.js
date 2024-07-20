import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

//Write A More Meaningful Health Check.
const healthCheck = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, true, "ALL OK!"));
});

export { healthCheck };