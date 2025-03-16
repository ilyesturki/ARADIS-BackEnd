import { startOfMonth, subMonths, format } from "date-fns";
import { Request, Response, NextFunction } from "express";
import { Op } from "sequelize";
import asyncHandler from "express-async-handler";
import Fps from "../models/Fps"; // Adjust import if needed
import ApiError from "../utils/ApiError"; // Adjust import if needed

// Reusable function
export const getFpsStats = (status: "failed" | "completed") =>
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

export default {
  getFpsStats,
};
