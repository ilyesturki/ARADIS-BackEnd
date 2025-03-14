import QRCode from "qrcode";
import { customCloudinary } from "./uploadToCloudinary";

export const createQRCode = async (fpsId: string): Promise<string> => {
  try {
    // Generate QR code image as a buffer
    const qrCodeImage = await QRCode.toBuffer(fpsId);
    console.log("QR Code generated:", qrCodeImage);

    // Upload to Cloudinary
    const uploadResult = await customCloudinary(qrCodeImage);
    console.log("Cloudinary upload result:", uploadResult);

    // Return the Cloudinary URL
    return uploadResult.secure_url;
  } catch (error) {
    console.error("Error generating or uploading QR code:", error);
    throw new Error("Failed to generate or upload QR Code");
  }
};
