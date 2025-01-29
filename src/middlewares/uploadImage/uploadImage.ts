import multer from "multer";
import ApiError from "../../utils/ApiError";

import { Request } from "express";

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();
  const multerFilter = function (
    req: Request,
    file: { mimetype: string },
    cb: (arg0: ApiError, arg1: boolean) => void
  ) {
    if (file.mimetype.split("/")[0] === "image") {
      cb(null, true);
    } else {
      cb(new ApiError("only Images allowed -_-", 400), false);
    }
  };

  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 1024 * 1024 * 10 },
  });
  return upload;
};

export const uploadSingleImage = (fieldName: string) =>
  multerOptions().single(fieldName);

export const uploadMixOfImages = (arrayOfFields: multer.Field[]) =>
  multerOptions().fields(arrayOfFields);
