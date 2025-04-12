import Tag from "../models/Tag";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import User from "../models/User";
import TagHelper from "../models/TagHelper";

import { Op } from "sequelize";
import { addDays, format, startOfMonth, subDays, subMonths } from "date-fns";

export const getTagPerformanceStats = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { timeRange } = req.params;

    const today = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "7d") daysToSubtract = 7;

    const startDate = subDays(today, daysToSubtract - 1); // Subtract correctly (today included)

    // Fetch TAG records in range
    const tagRecords = await Tag.findAll({
      where: { closeDate: { [Op.gte]: startDate } },
    });

    // Step 1: Build map of date => { toDo, done }
    const statsMap: {
      [key: string]: { date: string; open: number; toDo: number; done: number };
    } = {};

    tagRecords.forEach((tag) => {
      if (!tag.closeDate) return;
      const dateKey = format(tag.closeDate, "yyyy-MM-dd");

      if (!statsMap[dateKey]) {
        statsMap[dateKey] = { date: dateKey, open: 0, toDo: 0, done: 0 };
      }
      if (tag.status === "open") statsMap[dateKey].open++;
      else if (tag.status === "toDo") statsMap[dateKey].toDo++;
      else if (tag.status === "done") statsMap[dateKey].done++;
    });

    // Step 2: Generate full date range and fill missing
    const result: { date: string; open: number; toDo: number; done: number }[] =
      [];
    let currentDate = startDate;

    for (let i = 0; i < daysToSubtract; i++) {
      const dateKey = format(currentDate, "yyyy-MM-dd");

      if (statsMap[dateKey]) {
        result.push(statsMap[dateKey]);
      } else {
        result.push({ date: dateKey, open: 0, toDo: 0, done: 0 });
      }
      currentDate = addDays(currentDate, 1);
    }

    res.status(200).json({
      status: "success",
      data: result,
    });
  }
);

export const getTagStatusOverviewChartData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Find the TAG record
    const tagRecords = await Tag.findAll();

    // If TAG record is not found, throw an error
    if (!tagRecords) {
      return next(new ApiError("No TAG records found", 404));
    }

    // Transform the data to exclude IDs and timestamps
    const transformedTag = {
      total: tagRecords.length,
      open: tagRecords.filter((tag) => tag.status === "open").length,
      toDo: tagRecords.filter((tag) => tag.status === "toDo").length,
      done: tagRecords.filter((tag) => tag.status === "done").length,
    };

    // Respond with the TAG data
    res.status(200).json({
      status: "success",
      data: transformedTag,
    });
  }
);
export const getAllTagQrCodeScanStatistics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const today = new Date();
    const fiveMonthsAgo = new Date(
      today.getFullYear(),
      today.getMonth() - 4,
      1
    );

    // Generate last 5 months in "YYYY-MM" format
    const lastFiveMonths = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      return date.toISOString().slice(0, 7);
    }).reverse();

    // Fetch TAG records created in the last 5 months (ignoring closeDate)
    const tagRecords = await Tag.findAll({
      where: { createdAt: { [Op.gte]: fiveMonthsAgo } },
      include: [{ model: TagHelper, as: "tagHelper" }],
    });

    // Define statistics map
    const statsMap: Record<
      string,
      { month: string; scanned: number; unscanned: number }
    > = {};

    tagRecords.forEach((tag) => {
      const monthKey = tag.createdAt.toISOString().slice(0, 7); // Group by createdAt month

      if (!statsMap[monthKey]) {
        statsMap[monthKey] = { month: monthKey, scanned: 0, unscanned: 0 };
      }

      if (!tag.tagHelper) return;
      tag.tagHelper.forEach((helper) => {
        if (helper.scanStatus === "scanned") statsMap[monthKey].scanned++;
        else statsMap[monthKey].unscanned++;
      });
    });

    // Ensure all months are present in the response
    const statsArray = lastFiveMonths.map((month) => ({
      month,
      scanned: statsMap[month]?.scanned || 0,
      unscanned: statsMap[month]?.unscanned || 0,
    }));

    res.status(200).json({ status: "success", data: statsArray });
  }
);
// export const getAllTagQrCodeScanStatistics = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const today = new Date();

//     // Step 1: Get the last 5 months in "YYYY-MM" format
//     const lastFiveMonths = Array.from({ length: 5 }, (_, i) => {
//       const date = new Date();
//       date.setMonth(today.getMonth() - i);
//       return date.toISOString().slice(0, 7);
//     }).reverse(); // Chronological order

//     const fiveMonthsAgo = new Date();
//     fiveMonthsAgo.setMonth(today.getMonth() - 4); // Include current month too

//     // Step 2: Fetch TAG records in last 5 months
//     const tagRecords = await Tag.findAll({
//       where: { createdAt: { [Op.gte]: fiveMonthsAgo } },
//       include: [{ model: TagHelper, as: "tagHelper" }],
//     });

//     // Step 3: Build stats object
//     const statsMap: {
//       [key: string]: { month: string; scanned: number; unscanned: number };
//     } = {};

//     tagRecords.forEach((tag) => {
//       if (!tag.closeDate) return;
//       const monthKey = tag.closeDate.toISOString().slice(0, 7);

//       if (!statsMap[monthKey]) {
//         statsMap[monthKey] = { month: monthKey, scanned: 0, unscanned: 0 };
//       }

//       tag.tagHelper?.forEach((helper) => {
//         if (helper.scanStatus === "scanned") statsMap[monthKey].scanned++;
//         else statsMap[monthKey].unscanned++;
//       });
//     });

//     // Step 4: Ensure all last 5 months are present (fill missing months)
//     const statsArray = lastFiveMonths.map((month) => ({
//       month,
//       scanned: statsMap[month]?.scanned || 0,
//       unscanned: statsMap[month]?.unscanned || 0,
//     }));

//     res.status(200).json({ status: "success", data: statsArray });
//   }
// );

const getTagStats = (status: "done" | "toDo") =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const currentDate = new Date();
    const startMonth = startOfMonth(subMonths(currentDate, 4)); // Last 5 months including current

    const tagRecords = await Tag.findAll({
      where: { closeDate: { [Op.gte]: startMonth }, status },
    });

    // Initialize stats
    const stats: { [key: string]: { month: string; tagCount: number } } = {};

    for (let i = 0; i < 5; i++) {
      const monthDate = subMonths(currentDate, i);
      const monthKey = format(monthDate, "MMM");
      stats[monthKey] = { month: monthKey, tagCount: 0 };
    }

    // Populate records
    tagRecords.forEach((tag) => {
      if (!tag.closeDate) return;
      const monthKey = format(tag.closeDate, "MMM");
      if (stats[monthKey]) {
        stats[monthKey].tagCount++;
      }
    });

    const sortedStats = Object.values(stats).reverse();

    res.status(200).json({
      status: "success",
      data: sortedStats,
    });
  });
export const getCompletedTagStats = getTagStats("done");
export const getFailedTagStats = getTagStats("toDo");

export const getSelectedUsersForTag = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: tagId } = req.params;

    // Fetch all TAG records for the logged-in user
    const tagRecords = await TagHelper.findAll({
      where: { tagId },
      include: [
        { model: User, as: "user" },
        { model: Tag, as: "tag" },
      ],
    });
    console.log(tagRecords);
    // Transform the TAG records
    const transformedSelectedUsersForTag = tagRecords.map((tag) => ({
      id: tag.id,
      email: tag.user.email,
      firstName: tag.user.firstName,
      lastName: tag.user.lastName,
      scanStatus: tag.scanStatus,
      image: tag.user.image,
    }));
    console.log(transformedSelectedUsersForTag);

    // Respond with the TAG data
    res.status(200).json({
      status: "success",
      data: transformedSelectedUsersForTag,
    });
  }
);

export const getTagQrCode = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: tagId } = req.params;
    // Find the TAG record
    const tag = await Tag.findOne({
      where: { tagId },
    });

    // If TAG record is not found, throw an error
    if (!tag) {
      return next(
        new ApiError("TAG record not found for the provided tagId.", 404)
      );
    }

    // Convert Sequelize object to plain JSON to avoid circular structure errors
    const JSONTag = tag.toJSON();

    // Transform the data to exclude IDs and timestamps
    const transformedTag = {
      qrCodeUrl: JSONTag.qrCodeUrl,
      image: JSONTag.image,
    };

    // Respond with the TAG data
    res.status(200).json({
      status: "success",
      data: transformedTag,
    });
  }
);

export const getTagQrCodeScanStatistics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: tagId } = req.params;
    // Find the TAG record
    const tagHelpers = await TagHelper.findAll({
      where: { tagId },
    });

    // If TAG record is not found, throw an error
    if (!tagHelpers) {
      return next(
        new ApiError("TAG record not found for the provided tagId.", 404)
      );
    }

    // Transform the data to exclude IDs and timestamps
    const transformedTag = {
      total: tagHelpers.length,
      scanned: tagHelpers.filter((tag) => tag.scanStatus === "scanned").length,
      unScanned: tagHelpers.filter((tag) => tag.scanStatus === "unscanned")
        .length,
    };

    // Respond with the TAG data
    res.status(200).json({
      status: "success",
      data: transformedTag,
    });
  }
);
