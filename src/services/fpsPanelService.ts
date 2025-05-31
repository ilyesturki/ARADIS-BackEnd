import Fps from "../models/Fps";
import FpsProblem from "../models/FpsProblem";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import User from "../models/User";
import FpsHelper from "../models/FpsHelper";

import { Op } from "sequelize";
import { addDays, format, startOfMonth, subDays, subMonths } from "date-fns";
import TagHelper from "../models/TagHelper";
import Tag from "../models/Tag";

export const getFpsPerformanceStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { timeRange } = req.params;

    const today = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "7d") daysToSubtract = 7;

    const startDate = subDays(today, daysToSubtract - 1); 

    const fpsRecords = await Fps.findAll({
      where: {
        closeDate: { [Op.gte]: startDate },
        ...(req.query.machine && { "$problem.machine$": req.query.machine }),
      },
      include: [{ model: FpsProblem, as: "problem" }],
    });

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
    const fpsRecords = await Fps.findAll({
      where: {
        ...(req.query.machine && { "$problem.machine$": req.query.machine }),
      },
      include: [{ model: FpsProblem, as: "problem" }],
    });

    if (!fpsRecords) {
      return next(new ApiError("No FPS records found", 404));
    }

    const transformedFps = {
      total: fpsRecords.length,
      inProgress: fpsRecords.filter((fps) => fps.status === "inProgress")
        .length,
      completed: fpsRecords.filter((fps) => fps.status === "completed").length,
      failed: fpsRecords.filter((fps) => fps.status === "failed").length,
    };

    res.status(200).json({
      status: "success",
      data: transformedFps,
    });
  }
);
export const getAllFpsQrCodeScanStatistics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const today = new Date();
    const fiveMonthsAgo = new Date(
      today.getFullYear(),
      today.getMonth() - 4,
      1
    );

    const lastFiveMonths = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      return date.toISOString().slice(0, 7);
    }).reverse();

    const fpsRecords = await Fps.findAll({
      where: {
        createdAt: { [Op.gte]: fiveMonthsAgo },
        ...(req.query.machine && { "$problem.machine$": req.query.machine }),
      },
      include: [
        { model: FpsHelper, as: "fpsHelper" },
        { model: FpsProblem, as: "problem" },
      ],
    });

    const statsMap: Record<
      string,
      { month: string; scanned: number; unscanned: number }
    > = {};

    fpsRecords.forEach((fps) => {
      const monthKey = fps.createdAt.toISOString().slice(0, 7);

      if (!statsMap[monthKey]) {
        statsMap[monthKey] = { month: monthKey, scanned: 0, unscanned: 0 };
      }

      if (!fps.fpsHelper) return;
      fps.fpsHelper.forEach((helper) => {
        if (helper.scanStatus === "scanned") statsMap[monthKey].scanned++;
        else statsMap[monthKey].unscanned++;
      });
    });

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
    const startMonth = startOfMonth(subMonths(currentDate, 4)); 

    const fpsRecords = await Fps.findAll({
      where: {
        closeDate: { [Op.gte]: startMonth },
        status,
        ...(req.query.machine && { "$problem.machine$": req.query.machine }),
      },
      include: [{ model: FpsProblem, as: "problem" }],
    });

    const stats: { [key: string]: { month: string; fpsCount: number } } = {};

    for (let i = 0; i < 5; i++) {
      const monthDate = subMonths(currentDate, i);
      const monthKey = format(monthDate, "MMM");
      stats[monthKey] = { month: monthKey, fpsCount: 0 };
    }

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

    const fpsRecords = await FpsHelper.findAll({
      where: { fpsId },
      include: [
        { model: User, as: "user" },
        { model: Fps, as: "fps" },
      ],
    });
    const transformedSelectedUsersForFps = fpsRecords.map((fps) => ({
      id: fps.id,
      email: fps.user.email,
      firstName: fps.user.firstName,
      lastName: fps.user.lastName,
      scanStatus: fps.scanStatus,
      image: fps.user.image,
    }));
    res.status(200).json({
      status: "success",
      data: transformedSelectedUsersForFps,
    });
  }
);

export const getFpsQrCode = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: fpsId } = req.params;
    const fps = await Fps.findOne({
      where: { fpsId },
      include: [{ model: FpsProblem, as: "problem" }],
    });
    if (!fps) {
      return next(
        new ApiError("FPS record not found for the provided fpsId.", 404)
      );
    }

    const JSONFps = fps.toJSON();

    const transformedFps = {
      qrCodeUrl: JSONFps.qrCodeUrl,
      image: JSONFps.problem.image,
    };

    res.status(200).json({
      status: "success",
      data: transformedFps,
    });
  }
);

export const getFpsQrCodeScanStatistics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: fpsId } = req.params;
    const fpsHelpers = await FpsHelper.findAll({
      where: { fpsId },
    });

    if (!fpsHelpers) {
      return next(
        new ApiError("FPS record not found for the provided fpsId.", 404)
      );
    }

    const transformedFps = {
      total: fpsHelpers.length,
      scanned: fpsHelpers.filter((fps) => fps.scanStatus === "scanned").length,
      unScanned: fpsHelpers.filter((fps) => fps.scanStatus === "unscanned")
        .length,
    };

    res.status(200).json({
      status: "success",
      data: transformedFps,
    });
  }
);

export const getHelperActions = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: userId } = req.params;

    const fpsRecords = await FpsHelper.findAll({
      where: { userId },
      include: [{ model: Fps, as: "fps" }],
      order: [
        ['createdAt', 'DESC']
      ]
    });
    const tagRecords = await TagHelper.findAll({
      where: { userId },
      include: [{ model: Tag, as: "tag" }],
      order: [
        ['createdAt', 'DESC']
      ]
    });

    const helperActions = [ ...fpsRecords.map((fps) => ({
      type:"fps",
        fpsId: fps.fps.fpsId,
        status: fps.fps.status,
        scanStatus: fps.scanStatus,
        createdAt: fps.createdAt,
      })),
      ...tagRecords.map((tag) => ({
        type:"tag",
        tagId: tag.tag.tagId,
        status: tag.tag.status,
        scanStatus: tag.scanStatus,
        createdAt: tag.createdAt,
      }))].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    console.log(helperActions);
    
    res.status(200).json({
      status: "success",
      data: helperActions,
    });
  }
);
