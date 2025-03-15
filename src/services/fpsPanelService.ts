import Fps from "../models/Fps";
import FpsProblem from "../models/FpsProblem";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import User from "../models/User";
import FpsHelper from "../models/FpsHelper";

export const getSelectedUsersForFps = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: fpsId } = req.params;

    // Fetch all FPS records for the logged-in user
    const fpsRecords = await FpsHelper.findAll({
      where: { fpsId },
      include: [
        { model: User, as: "user" },
        { model: Fps, as: "fps" },
      ],
    });
    console.log(fpsRecords);
    // Transform the FPS records
    const transformedSelectedUsersForFps = fpsRecords.map((fps) => ({
      id: fps.id,
      email: fps.user.email,
      firstName: fps.user.firstName,
      lastName: fps.user.lastName,
      scanStatus: fps.scanStatus,
      image: fps.user.image,
    }));
    console.log(transformedSelectedUsersForFps);

    // Respond with the FPS data
    res.status(200).json({
      status: "success",
      data: transformedSelectedUsersForFps,
    });
  }
);

export const getFpsQrCode = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: fpsId } = req.params;
    // Find the FPS record
    const fps = await Fps.findOne({
      where: { fpsId },
      include: [{ model: FpsProblem, as: "problem" }],
    });

    // If FPS record is not found, throw an error
    if (!fps) {
      return next(
        new ApiError("FPS record not found for the provided fpsId.", 404)
      );
    }

    // Convert Sequelize object to plain JSON to avoid circular structure errors
    const JSONFps = fps.toJSON();

    // Transform the data to exclude IDs and timestamps
    const transformedFps = {
      qrCodeUrl: JSONFps.qrCodeUrl,
      image: JSONFps.problem.image,
    };

    // Respond with the FPS data
    res.status(200).json({
      status: "success",
      data: transformedFps,
    });
  }
);

export const getFpsQrCodeScanStatistics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: fpsId } = req.params;
    // Find the FPS record
    const fpsHelpers = await FpsHelper.findAll({
      where: { fpsId },
    });

    // If FPS record is not found, throw an error
    if (!fpsHelpers) {
      return next(
        new ApiError("FPS record not found for the provided fpsId.", 404)
      );
    }

    // Transform the data to exclude IDs and timestamps
    const transformedFps = {
      total: fpsHelpers.length,
      scanned: fpsHelpers.filter((fps) => fps.scanStatus === "scanned").length,
      notScanned: fpsHelpers.filter((fps) => fps.scanStatus === "notScanned")
        .length,
    };

    // Respond with the FPS data
    res.status(200).json({
      status: "success",
      data: transformedFps,
    });
  }
);
