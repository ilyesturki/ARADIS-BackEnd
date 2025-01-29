import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
// cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// api_key: process.env.CLOUDINARY_API_KEY,
// api_secret: process.env.CLOUDINARY_API_SECRET,
interface CloudinaryUploadResult {
  secure_url: string;
}

cloudinary.config({
  cloud_name: "djkqlrhz4",
  api_key: "873949778948477",
  api_secret: "QkfkmzhI08Jq6B4T6BZC_eIuDiU",
});

const uploadToCloudinary = async (
  buffer: Buffer,
  options: object
): Promise<CloudinaryUploadResult> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (result) {
          resolve(result as CloudinaryUploadResult);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const customCloudinary = (img: Buffer) => {
  return uploadToCloudinary(img, {
    folder: "products",
    format: "png",
    transformation: [
      { width: 2000, height: 1333, crop: "limit", quality: "auto" },
    ],
  });
};

export default uploadToCloudinary;
