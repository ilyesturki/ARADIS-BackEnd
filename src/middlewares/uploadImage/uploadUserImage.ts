import { uploadSingleImage } from "./uploadImage";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";

import { customCloudinary } from "../../utils/uploadToCloudinary";

export const uploadUserImage = uploadSingleImage("image");

export const resizeUserImage = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      const result = await customCloudinary(req.file.buffer);
      req.body.image = result.secure_url;
    }

    next();
  }
);
