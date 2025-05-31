import QRCode from "qrcode";
import { customCloudinary } from "./uploadToCloudinary";

export const createQRCode = async (id: string): Promise<string> => {
  try {
    const qrCodeImage = await QRCode.toBuffer(id);
    console.log("QR Code generated:", qrCodeImage);

    const uploadResult = await customCloudinary(qrCodeImage);
    console.log("Cloudinary upload result:", uploadResult);

    return uploadResult.secure_url;
  } catch (error) {
    console.error("Error generating or uploading QR code:", error);
    throw new Error("Failed to generate or upload QR Code");
  }
};
