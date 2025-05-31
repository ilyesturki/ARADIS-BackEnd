import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError";

const extractUserId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError("Not authorized to access this route", 401));
    }

    req.params.id = req.user.id.toString(); 
    next();
  }
);

export default extractUserId;
