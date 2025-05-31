import Tag from "../models/Tag";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";

import { io } from "../index";

import ApiError from "../utils/ApiError";
import SortingResults from "../models/SortingResults";
import ImmediateActions from "../models/ImmediateActions";
import dbConnect from "../config/dbConnect";
import User from "../models/User";
import { createQRCode } from "../utils/createQRCode";
import { sendNotification } from "../utils/sendNotification";
import TagAction from "../models/TagAction";
import TagHelper from "../models/TagHelper";
import { TagActionType } from "../types/TagActionType";
const sequelize = dbConnect();


export const createTag = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      zone,
      machine,
      equipment,
      description,
      category,
      priority,
      image,
      images,
    } = req.body;

    const { id: tagId } = req.params;
    const userId = req.user?.id;

    let existingTag = await Tag.findOne({ where: { tagId } });

    if (existingTag) {
      return next(new ApiError("Tag with this ID already exists.", 409));
    }

    const qrCodeUrl = await createQRCode(tagId);

    const tag = await Tag.create({
      tagId,
      zone,
      machine,
      equipment,
      description,
      category,
      priority,
      image: image ?? null,
      images: images ?? null,
      userId,
      qrCodeUrl,
    });

    res.status(201).json({
      status: "success",
      message: "Tag created successfully.",
      data: tag,
    });
  }
);

export const createOrUpdateTagActions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: tagId } = req.params;

    const newActions: TagActionType[] = JSON.parse(req.body.actions);

    const tag = await Tag.findOne({ where: { tagId } });
    if (!tag) {
      return next(
        new ApiError("TAG record not found for the provided tagId.", 404)
      );
    }

    if (tag.status == "done") {
      return next(new ApiError("TAG is already done.", 409));
    }
    if (tag.status == "open") {
      tag.status = "toDo";
      await tag.save();
    }

    const transaction = await sequelize.transaction();

    try {
      const existingActions = await TagAction.findAll({
        where: { tagId },
        transaction,
      });

      const existingMap = new Map(
        existingActions.map((a) => [a.userService, a])
      );
      const incomingMap = new Map(newActions.map((a) => [a.userService, a]));

      const toCreate = newActions.filter(
        (a) => !existingMap.has(a.userService)
      );

      const toUpdate = newActions.filter((a) => {
        const e = existingMap.get(a.userService);
        return (
          e &&
          (e.procedure !== a.procedure ||
            e.userCategory !== a.userCategory ||
            e.quand !== a.quand)
        );
      });

      const toDelete = [...existingMap.keys()].filter(
        (s) => !incomingMap.has(s)
      );

      if (toDelete.length) {
        await TagAction.destroy({
          where: { tagId, userService: toDelete },
          transaction,
        });

        const userIds = await User.findAll({
          where: { userService: toDelete },
        }).then((users) => users.map((u) => u.id));

        await TagHelper.destroy({
          where: { tagId, userId: userIds },
          transaction,
        });
      }

      for (const action of toCreate) {
        const { procedure, userCategory, userService, quand } = action;

        await TagAction.create(
          { procedure, userCategory, userService, quand, tagId },
          { transaction }
        );

        const users = await User.findAll({
          where: { userService, userCategory },
        });

        await Promise.all(
          users.map(async (user) => {
            const already = await TagHelper.findOne({
              where: { tagId, userId: user.id },
              transaction,
            });

            if (!already) {
              await TagHelper.create(
                { tagId, userId: user.id, scanStatus: "unscanned" },
                { transaction }
              );

              await sendNotification(io, {
                userId: user.id.toString(),
                tagId,
                title: "New TAG Action",
                message: `You have been assigned to TAG #${tagId} for ${procedure}.`,
                sender: `${req.user?.firstName ?? "System"} ${
                  req.user?.lastName ?? ""
                }`.trim(),
                priority: "High",
              });
            }
          })
        );
      }

      for (const action of toUpdate) {
        await TagAction.update(
          {
            procedure: action.procedure,
            userCategory: action.userCategory,
            quand: action.quand,
          },
          {
            where: { tagId, userService: action.userService },
            transaction,
          }
        );
      }

      await transaction.commit();

      res.status(200).json({
        status: "success",
        message: "Tag actions synced successfully.",
        data: {
          tagId,
          created: toCreate.length,
          updated: toUpdate.length,
          deleted: toDelete.length,
        },
      });
    } catch (err) {
      await transaction.rollback();
      console.error("Sync error:", err);
      return next(new ApiError("Failed to sync tag actions.", 500));
    }
  }
);

export const createTagValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: tagId } = req.params;
    const tag = await Tag.findOne({ where: { tagId }, include: [TagHelper] });
    if (!tag) {
      return next(
        new ApiError("TAG record not found for the provided tagId.", 404)
      );
    }

    await tag.update({ status: "done" });

    if (tag.tagHelper && tag.tagHelper.length > 0) {
      for (const helper of tag.tagHelper) {
        await sendNotification(io, {
          userId: helper.userId.toString(),
          tagId: tag.tagId,
          title: "TAG Final Validation",
          message: `TAG #${tag.tagId} has been marked as Done. Thank you for your assistance!`,
          sender: req.user?.firstName + " " + req.user?.lastName,
          priority: "High",
        });
      }
    }

    res.status(201).json({
      status: "success",
      message: "Final status updated successfully.",
      data: {
        tagId: tag.tagId,
      },
    });
  }
);

export const getTagByTagId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: tagId } = req.params;
    const userId = req.user?.id;

    const tag = await Tag.findOne({
      where: { tagId },
      include: [{ model: TagAction, as: "tagAction" }],
    });

    if (!tag) {
      return next(
        new ApiError("TAG record not found for the provided tagId.", 404)
      );
    }

    const JSONTag = tag.toJSON();

    const transformedTag = {
      tagId: JSONTag.tagId,
      zone: JSONTag.zone,
      machine: JSONTag.machine,
      equipment: JSONTag.equipment,
      image: JSONTag.image,
      images: JSONTag.images,
      qrCodeUrl: JSONTag.qrCodeUrl,
      status: JSONTag.status,
      tagActions:
        JSONTag.tagAction?.map(
          ({ procedure, userCategory, userService, quand }: TagActionType) => {
            return { procedure, userCategory, userService, quand };
          }
        ) || [],
    };

    res.status(200).json({
      status: "success",
      data: transformedTag,
    });
  }
);


export const scanTagQRCode = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: tagId } = req.params;
    const userId = req.user?.id;

    const tag = await Tag.findOne({ where: { tagId } });
    if (!tag) {
      return next(new ApiError("TAG not found.", 404));
    }

    const helper = await TagHelper.findOne({ where: { tagId, userId } });
    if (!helper) {
      return next(
        new ApiError("You are not assigned to this TAG or have no access.", 403)
      );
    }

    await helper.update({ scanStatus: "scanned" });

    res.status(200).json({
      status: "success",
      message: "TAG scanned successfully.",
    });
  }
);

export const getAllTag = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = limit ? (page - 1) * limit : undefined;

  const count = await Tag.count();

  const tagRecords = await Tag.findAll({
    ...(limit && { limit }),
    ...(offset !== undefined && { offset }),
    where: {
      ...(req.query.machine && { machine: req.query.machine }),
    },
    include: [
      { model: TagAction, as: "tagAction" },
      { model: User, as: "user" },
    ],
  });

  const transformedTagRecords = tagRecords.map((tag) => ({
    tagId: tag.tagId,
    zone: tag.zone,
    machine: tag.machine,
    description: tag.description,
    category: tag.category,
    priority: tag.priority,
    equipment: tag.equipment,
    image: tag.image,
    images: tag.images,
    qrCodeUrl: tag.qrCodeUrl,
    status: tag.status,
    tagAction: tag.tagAction?.map(({ id, tagId, ...rest }) => rest),
    user: {
      firstName: tag.user.firstName,
      lastName: tag.user.lastName,
      image: tag.user.image,
    },
    createdAt: tag.createdAt,
  }));

  const paginationResult = limit
    ? {
        currentPage: page,
        limit,
        numberOfPages: Math.ceil(count / limit),
        totalItems: count,
      }
    : null;

  res.status(200).json({
    status: "success",
    data: transformedTagRecords,
    ...(paginationResult && { pagination: paginationResult }),
  });
});
