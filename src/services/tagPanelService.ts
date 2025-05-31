import Tag from "../models/Tag";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import User from "../models/User";
import TagHelper from "../models/TagHelper";

import { Op } from "sequelize";
import { addDays, format, startOfMonth, subDays, subMonths } from "date-fns";

export const getTagStatusOverviewChartData = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const tagRecords = await Tag.findAll({
      where: {
        ...(req.query.machine && { machine: req.query.machine }),
      },
    });

    if (!tagRecords) {
      return next(new ApiError("No TAG records found", 404));
    }

    const transformedTag = {
      total: tagRecords.length,
      open: tagRecords.filter((tag) => tag.status === "open").length,
      toDo: tagRecords.filter((tag) => tag.status === "toDo").length,
      done: tagRecords.filter((tag) => tag.status === "done").length,
    };

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

    const lastFiveMonths = Array.from({ length: 5 }, (_, i) => {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      return date.toISOString().slice(0, 7);
    }).reverse();

    const tagRecords = await Tag.findAll({
      where: {
        createdAt: { [Op.gte]: fiveMonthsAgo },
        ...(req.query.machine && { machine: req.query.machine }),
      },
      include: [{ model: TagHelper, as: "tagHelper" }],
    });

    const statsMap: Record<
      string,
      { month: string; scanned: number; unscanned: number }
    > = {};

    tagRecords.forEach((tag) => {
      const monthKey = tag.createdAt.toISOString().slice(0, 7);

      if (!statsMap[monthKey]) {
        statsMap[monthKey] = { month: monthKey, scanned: 0, unscanned: 0 };
      }

      if (!tag.tagHelper) return;
      tag.tagHelper.forEach((helper) => {
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

const getTagStats = (status: "done" | "toDo") =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const currentDate = new Date();
    const startMonth = startOfMonth(subMonths(currentDate, 4)); 

    const tagRecords = await Tag.findAll({
      where: {
        closeDate: { [Op.gte]: startMonth },
        status,
        ...(req.query.machine && { machine: req.query.machine }),
      },
    });

    const stats: { [key: string]: { month: string; tagCount: number } } = {};

    for (let i = 0; i < 5; i++) {
      const monthDate = subMonths(currentDate, i);
      const monthKey = format(monthDate, "MMM");
      stats[monthKey] = { month: monthKey, tagCount: 0 };
    }

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

export const getTagQrCodeScanStatistics = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: tagId } = req.params;
    const tagHelpers = await TagHelper.findAll({
      where: { tagId },
    });

    if (!tagHelpers) {
      return next(
        new ApiError("TAG record not found for the provided tagId.", 404)
      );
    }

    const transformedTag = {
      total: tagHelpers.length,
      scanned: tagHelpers.filter((tag) => tag.scanStatus === "scanned").length,
      unScanned: tagHelpers.filter((tag) => tag.scanStatus === "unscanned")
        .length,
    };

    res.status(200).json({
      status: "success",
      data: transformedTag,
    });
  }
);

export const getSelectedUsersForTag = asyncHandler(
  async (req: Request, res: Response) => {
    const { id: tagId } = req.params;

    const tagRecords = await TagHelper.findAll({
      where: { tagId },
      include: [
        { model: User, as: "user" },
        { model: Tag, as: "tag" },
      ],
    });
    console.log(tagRecords);
    const transformedSelectedUsersForTag = tagRecords.map((tag) => ({
      id: tag.id,
      email: tag.user.email,
      firstName: tag.user.firstName,
      lastName: tag.user.lastName,
      scanStatus: tag.scanStatus,
      image: tag.user.image,
    }));
    console.log(transformedSelectedUsersForTag);

    res.status(200).json({
      status: "success",
      data: transformedSelectedUsersForTag,
    });
  }
);

export const getTagQrCode = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: tagId } = req.params;
    const tag = await Tag.findOne({
      where: { tagId },
    });

    if (!tag) {
      return next(
        new ApiError("TAG record not found for the provided tagId.", 404)
      );
    }

    const JSONTag = tag.toJSON();

    const transformedTag = {
      qrCodeUrl: JSONTag.qrCodeUrl,
      image: JSONTag.image,
    };

    res.status(200).json({
      status: "success",
      data: transformedTag,
    });
  }
);
