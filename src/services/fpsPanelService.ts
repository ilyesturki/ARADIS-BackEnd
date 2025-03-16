import Fps from "../models/Fps";
import FpsProblem from "../models/FpsProblem";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import User from "../models/User";
import FpsHelper from "../models/FpsHelper";

import { Op } from "sequelize";
import { format, subDays, subMonths } from "date-fns";

export const getFpsPerformanceStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { timeRange } = req.params;

    const today = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "7d") daysToSubtract = 7;

    const startDate = subDays(today, daysToSubtract);

    const fpsRecords = await Fps.findAll({
      where: {
        createdAt: { [Op.gte]: startDate },
      },
    });

    if (!fpsRecords.length) {
      return next(new ApiError("No FPS records found.", 404));
    }

    const stats: {
      [key: string]: { date: string; completed: number; failed: number };
    } = {};

    fpsRecords.forEach((fps) => {
      const date = format(fps.createdAt, "yyyy-MM-dd");

      if (!stats[date]) {
        stats[date] = { date, completed: 0, failed: 0 };
      }
      if (fps.status === "completed") {
        stats[date].completed++;
      } else if (fps.status === "failed") {
        stats[date].failed++;
      }
    });

    res.status(200).json({ status: "success", data: Object.values(stats) });
  }
);

export const getFpsStatusOverviewChartData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Find the FPS record
    const fpsRecords = await Fps.findAll();

    // If FPS record is not found, throw an error
    if (!fpsRecords) {
      return next(new ApiError("No FPS records found", 404));
    }

    // Transform the data to exclude IDs and timestamps
    const transformedFps = {
      total: fpsRecords.length,
      inProgress: fpsRecords.filter((fps) => fps.status === "inProgress")
        .length,
      completed: fpsRecords.filter((fps) => fps.status === "completed").length,
      failed: fpsRecords.filter((fps) => fps.status === "failed").length,
    };

    // Respond with the FPS data
    res.status(200).json({
      status: "success",
      data: transformedFps,
    });
  }
);
export const getAllFpsQrCodeScanStatistics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);

    const fpsRecords = await Fps.findAll({
      where: { closeDate: { [Op.gte]: fiveMonthsAgo } },
      include: [{ model: FpsHelper, as: "fpsHelper" }],
    });

    if (!fpsRecords.length) {
      return next(
        new ApiError("No FPS records found for the last 5 months.", 404)
      );
    }

    const stats: {
      [key: string]: { month: string; scanned: number; unscanned: number };
    } = {};

    fpsRecords.forEach((fps) => {
      if (!fps.closeDate) return;
      const month = fps.closeDate.toISOString().slice(0, 7);

      if (!stats[month]) {
        stats[month] = { month, scanned: 0, unscanned: 0 };
      }

      fps.fpsHelper?.forEach((helper) => {
        if (helper.scanStatus === "scanned") {
          stats[month].scanned++;
        } else {
          stats[month].unscanned++;
        }
      });
    });

    // Convert object to array to return a table-like format
    const statsArray = Object.values(stats);

    res.status(200).json({ status: "success", data: statsArray });
  }
);

export const getCompletedFpsStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const sixMonthsAgo = subMonths(new Date(), 6);

    const fpsRecords = await Fps.findAll({
      where: { closeDate: { [Op.gte]: sixMonthsAgo }, status: "completed" },
    });

    if (!fpsRecords.length) {
      return next(
        new ApiError("No FPS records found for the last 6 months.", 404)
      );
    }

    const stats: { [key: string]: { month: string; completedFPS: number } } =
      {};

    fpsRecords.forEach((fps) => {
      if (!fps.closeDate) return;
      const month = format(fps.closeDate, "MMM"); // Example: "Jan", "Feb"

      if (!stats[month]) {
        stats[month] = { month, completedFPS: 0 };
      }
      stats[month].completedFPS++;
    });

    res.status(200).json({ status: "success", data: Object.values(stats) });
  }
);

export const getFailedFpsStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const sixMonthsAgo = subMonths(new Date(), 6);

    const fpsRecords = await Fps.findAll({
      where: { closeDate: { [Op.gte]: sixMonthsAgo }, status: "failed" },
    });

    if (!fpsRecords.length) {
      return next(
        new ApiError("No FPS records found for the last 6 months.", 404)
      );
    }

    const stats: { [key: string]: { month: string; failedFPS: number } } = {};

    fpsRecords.forEach((fps) => {
      if (!fps.closeDate) return;
      const month = format(fps.closeDate, "MMM"); // Example: "Jan", "Feb"

      if (!stats[month]) {
        stats[month] = { month, failedFPS: 0 };
      }
      stats[month].failedFPS++;
    });

    res.status(200).json({ status: "success", data: Object.values(stats) });
  }
);

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
      unScanned: fpsHelpers.filter((fps) => fps.scanStatus === "unscanned")
        .length,
    };

    // Respond with the FPS data
    res.status(200).json({
      status: "success",
      data: transformedFps,
    });
  }
);
