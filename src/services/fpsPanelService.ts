import Fps from "../models/Fps";
import FpsProblem from "../models/FpsProblem";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import User from "../models/User";
import FpsHelper from "../models/FpsHelper";

import { Op } from "sequelize";
import { addDays, format, startOfMonth, subDays, subMonths } from "date-fns";

export const getFpsPerformanceStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { timeRange } = req.params;

    const today = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "7d") daysToSubtract = 7;

    const startDate = subDays(today, daysToSubtract - 1); // Subtract correctly (today included)

    // Fetch FPS records in range
    const fpsRecords = await Fps.findAll({
      where: { closeDate: { [Op.gte]: startDate } },
    });

    // Step 1: Build map of date => { completed, failed }
    const statsMap: {
      [key: string]: { date: string; completed: number; failed: number };
    } = {};

    fpsRecords.forEach((fps) => {
      if (!fps.closeDate) return;
      const dateKey = format(fps.closeDate, "yyyy-MM-dd");

      if (!statsMap[dateKey]) {
        statsMap[dateKey] = { date: dateKey, completed: 0, failed: 0 };
      }
      if (fps.status === "completed") statsMap[dateKey].completed++;
      else if (fps.status === "failed") statsMap[dateKey].failed++;
    });

    // Step 2: Generate full date range and fill missing
    const result: { date: string; completed: number; failed: number }[] = [];
    let currentDate = startDate;

    for (let i = 0; i < daysToSubtract; i++) {
      const dateKey = format(currentDate, "yyyy-MM-dd");

      if (statsMap[dateKey]) {
        result.push(statsMap[dateKey]);
      } else {
        result.push({ date: dateKey, completed: 0, failed: 0 });
      }
      currentDate = addDays(currentDate, 1);
    }

    res.status(200).json({
      status: "success",
      data: result,
    });
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
    const today = new Date();

    // Step 1: Get the last 5 months in "YYYY-MM" format
    const lastFiveMonths = Array.from({ length: 5 }, (_, i) => {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      return date.toISOString().slice(0, 7);
    }).reverse(); // Chronological order

    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(today.getMonth() - 4); // Include current month too

    // Step 2: Fetch FPS records in last 5 months
    const fpsRecords = await Fps.findAll({
      where: { createdAt: { [Op.gte]: fiveMonthsAgo } },
      include: [{ model: FpsHelper, as: "fpsHelper" }],
    });

    // Step 3: Build stats object
    const statsMap: {
      [key: string]: { month: string; scanned: number; unscanned: number };
    } = {};

    fpsRecords.forEach((fps) => {
      if (!fps.closeDate) return;
      const monthKey = fps.closeDate.toISOString().slice(0, 7);

      if (!statsMap[monthKey]) {
        statsMap[monthKey] = { month: monthKey, scanned: 0, unscanned: 0 };
      }

      fps.fpsHelper?.forEach((helper) => {
        if (helper.scanStatus === "scanned") statsMap[monthKey].scanned++;
        else statsMap[monthKey].unscanned++;
      });
    });

    // Step 4: Ensure all last 5 months are present (fill missing months)
    const statsArray = lastFiveMonths.map((month) => ({
      month,
      scanned: statsMap[month]?.scanned || 0,
      unscanned: statsMap[month]?.unscanned || 0,
    }));

    res.status(200).json({ status: "success", data: statsArray });
  }
);

const getFpsStats = (status: "failed" | "completed") =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const currentDate = new Date();
    const startMonth = startOfMonth(subMonths(currentDate, 4)); // Last 5 months including current

    const fpsRecords = await Fps.findAll({
      where: { closeDate: { [Op.gte]: startMonth }, status },
    });

    // Initialize stats
    const stats: { [key: string]: { month: string; fpsCount: number } } = {};

    for (let i = 0; i < 5; i++) {
      const monthDate = subMonths(currentDate, i);
      const monthKey = format(monthDate, "MMM");
      stats[monthKey] = { month: monthKey, fpsCount: 0 };
    }

    // Populate records
    fpsRecords.forEach((fps) => {
      if (!fps.closeDate) return;
      const monthKey = format(fps.closeDate, "MMM");
      if (stats[monthKey]) {
        stats[monthKey].fpsCount++;
      }
    });

    const sortedStats = Object.values(stats).reverse();

    res.status(200).json({
      status: "success",
      data: sortedStats,
    });
  });
export const getCompletedFpsStats = getFpsStats("completed");
export const getFailedFpsStats = getFpsStats("failed");

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
