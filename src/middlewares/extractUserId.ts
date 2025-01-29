import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError";

const extractUserId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("///");
    console.log(req.user);
    console.log("///");
    if (!req.user) {
      return next(new ApiError("Not authorized to access this route", 401));
    }

    console.log(req.user._id.toString());
    req.params.id = req.user._id.toString(); // Set the user ID from token to req.params.id
    console.log("tt");
    console.log(req.params.id);
    next();
  }
);

export default extractUserId;
