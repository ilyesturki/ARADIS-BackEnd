import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";

import { customCloudinary } from "../../utils/uploadToCloudinary";
import { uploadMixOfImages } from "./uploadImage";

export const uploadTagImages = uploadMixOfImages([
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

export const resizeTagImages = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.files && isFieldDictionary(req.files)) {
      // Process single image upload (if it exists)
      if (req.files["image"]?.[0]) {
        const result = await customCloudinary(req.files["image"][0].buffer);
        req.body.image = result.secure_url;
      }

      // Process multiple image uploads (if they exist)
      if (req.files["images"]?.length > 0) {
        const uploadedImages = await Promise.all(
          req.files["images"].map(async (file) => {
            const result = await customCloudinary(file.buffer);
            return result.secure_url;
          })
        );
        req.body.images = uploadedImages.join(",");
      }
    }

    next();
  }
);

// Type Guard to ensure req.files is of the correct type
function isFieldDictionary(
  files: unknown
): files is { [fieldname: string]: Express.Multer.File[] } {
  return (
    typeof files === "object" &&
    files !== null &&
    !Array.isArray(files) &&
    Object.values(files).every((value) => Array.isArray(value))
  );
}
