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

// @desc    Create or update the problem part in TAG
// @route   POST /tag/problem
// @access  Private
export const createTag = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { zone, machine, equipment, image, images } = req.body;

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
    // Extract tagId from the request parameters
    const { id: tagId } = req.params;

    // Parse the incoming actions from the request body
    const newActions: TagActionType[] = JSON.parse(req.body.actions);

    // Find the corresponding TAG in the database
    const tag = await Tag.findOne({ where: { tagId } });
    if (!tag)
      return next(
        new ApiError("TAG record not found for the provided tagId.", 404)
      );

    // Start a Sequelize transaction for safety
    const transaction = await sequelize.transaction();

    try {
      // Fetch all existing actions linked to this TAG
      const existingActions = await TagAction.findAll({
        where: { tagId },
        transaction,
      });

      // Create maps for easy lookup: userService -> action
      const existingMap = new Map(
        existingActions.map((a) => [a.userService, a])
      );
      const incomingMap = new Map(newActions.map((a) => [a.userService, a]));

      // Identify new actions to be created (not in existingMap)
      const toCreate = newActions.filter(
        (a) => !existingMap.has(a.userService)
      );

      // Identify existing actions to be updated (data has changed)
      const toUpdate = newActions.filter((a) => {
        const e = existingMap.get(a.userService);
        return (
          e &&
          (e.procedure !== a.procedure ||
            e.userCategory !== a.userCategory ||
            e.quand !== a.quand)
        );
      });

      // Identify actions that are no longer in the incoming list and should be deleted
      const toDelete = [...existingMap.keys()].filter(
        (s) => !incomingMap.has(s)
      );

      // Handle deletions if needed
      if (toDelete.length) {
        // Delete TagActions for removed userServices
        await TagAction.destroy({
          where: { tagId, userService: toDelete },
          transaction,
        });

        // Get the user IDs that match the deleted userServices
        const userIds = await User.findAll({
          where: { userService: toDelete },
        }).then((users) => users.map((u) => u.id));

        // Delete associated TagHelper records
        await TagHelper.destroy({
          where: { tagId, userId: userIds },
          transaction,
        });
      }

      // Handle creation of new actions
      for (const action of toCreate) {
        const { procedure, userCategory, userService, quand } = action;

        // Create the new TagAction
        await TagAction.create(
          { procedure, userCategory, userService, quand, tagId },
          { transaction }
        );

        // Find all midel-management users for this userService
        const users = await User.findAll({
          where: { userService, userCategory },
        });

        // For each user, add them as a helper and send a notification
        await Promise.all(
          users.map(async (user) => {
            // Check if the user is already a TagHelper
            const already = await TagHelper.findOne({
              where: { tagId, userId: user.id },
              transaction,
            });

            if (!already) {
              // Create a new TagHelper record
              await TagHelper.create(
                { tagId, userId: user.id, scanStatus: "unscanned" },
                { transaction }
              );

              // Send a real-time notification to the user
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

      // Handle updates to existing actions
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

      // All operations succeeded, commit the transaction
      await transaction.commit();

      // Send success response with counts of each operation
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
      // Something went wrong, rollback the transaction
      await transaction.rollback();
      console.error("Sync error:", err);
      return next(new ApiError("Failed to sync tag actions.", 500));
    }
  }
);

// export const createOrUpdateTagActions = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { id: tagId } = req.params;
//     const { actions } = req.body;

//     let actionsArr;

//     try {
//       actionsArr = JSON.parse(actions);
//     } catch (error) {
//       return next(new ApiError("Invalid JSON format in actions.", 400));
//     }

//     if (!Array.isArray(actionsArr)) {
//       return next(new ApiError("Actions must be an array.", 400));
//     }

//     const tag = await Tag.findOne({ where: { tagId } });
//     if (!tag) {
//       return next(
//         new ApiError("TAG record not found for the provided tagId.", 404)
//       );
//     }

//     const transaction = await sequelize.transaction();

//     try {
//       // Delete all existing defensive actions for this TAG
//       await TagAction.destroy({
//         where: { tagId: tag.tagId },
//         transaction,
//       });

//       await TagHelper.destroy({
//         where: { tagId: tag.tagId },
//         transaction,
//       });

//       const selectedServices = actionsArr.map(({ userService }) => userService);

//       for (let i = 0; i < selectedServices.length; i++) {
//         const { procedure, userCategory, userService, quand } = actionsArr[i];
//         await TagAction.create(
//           {
//             procedure,
//             userCategory,
//             userService,
//             quand,
//             tagId: tag.tagId,
//           },
//           { transaction }
//         );

//         const usersInService = await User.findAll({
//           where: {
//             userService: selectedServices[i],
//             userCategory: "midel-management",
//           }, // Filter users by service
//         });

//         for (const user of usersInService) {
//           // ✅ Check if the user is already assigned as a helper for this TAG
//           const existingHelper = await TagHelper.findOne({
//             where: { tagId: tag.tagId, userId: user.id },
//           });

//           if (!existingHelper) {
//             // ✅ Add the user as a helper only if they are not already assigned
//             await TagHelper.create({
//               tagId: tag.tagId,
//               userId: user.id,
//               scanStatus: "unscanned", // Initial status
//             });

//             // ✅ Send notification only if they are newly assigned
//             await sendNotification(io, {
//               userId: user.id.toString(),
//               tagId: tag.tagId,
//               title: "New TAG Action",
//               message: `You have been assigned to TAG #${tag.tagId} for ${procedure}.`,
//               sender: req.user?.firstName + " " + req.user?.lastName, // Assuming `req.user` contains authenticated user data
//               priority: "High",
//             });
//           }
//         }
//       }

//       await transaction.commit();

//       res.status(201).json({
//         status: "success",
//         message: "Actions recreated successfully.",
//         data: {
//           tagId: tag.tagId,
//           actions: actionsArr,
//         },
//       });
//     } catch (error) {
//       await transaction.rollback();
//       next(
//         new ApiError(
//           "An error occurred while recreating defensive actions.",
//           500
//         )
//       );
//     }
//   }
// );

// @desc    Create or update the cause part in TAG
// @route   POST /tag/cause
// @access  Private
// export const createTagValidation = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { status } = req.body;
//     const { id: tagId } = req.params;
//     const tag = await Tag.findOne({ where: { tagId } });
//     if (!tag) {
//       return next(
//         new ApiError("TAG record not found for the provided tagId.", 404)
//       );
//     }

//     await tag.update({ status, currentStep: "validation" });

//     res.status(201).json({
//       status: "success",
//       message: "Status updated successfully.",
//       data: {
//         tagId: tag.tagId,
//       },
//     });
//   }
// );
export const createTagValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const { id: tagId } = req.params;
    const tag = await Tag.findOne({ where: { tagId }, include: [TagHelper] });
    if (!tag) {
      return next(
        new ApiError("TAG record not found for the provided tagId.", 404)
      );
    }

    // Always update to trigger notifications even if status is unchanged
    await tag.update({ status: "done" });

    // ✅ Send notification to all helpers about the final validation status sequentially
    if (tag.tagHelper && tag.tagHelper.length > 0) {
      for (const helper of tag.tagHelper) {
        await sendNotification(io, {
          userId: helper.userId.toString(),
          tagId: tag.tagId,
          title: "TAG Final Validation",
          message: `TAG #${tag.tagId} has been marked as '${status}'. Thank you for your assistance!`,
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

// @desc    Get TAG by tagId
// @route   GET /tag/:tagId
// @access  Private
export const getTagByTagId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: tagId } = req.params;
    const userId = req.user?.id;

    // Find the TAG record
    const tag = await Tag.findOne({
      where: { tagId },
      include: [{ model: TagAction, as: "tagAction" }],
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

    // Respond with the TAG data
    res.status(200).json({
      status: "success",
      data: transformedTag,
    });
  }
);

// @desc    Get all TAG records for the logged-in user
// @route   GET /tag
// @access  Private
// export const getAllTagForUser = asyncHandler(
//   async (req: Request, res: Response) => {
//     const userId = req.user?.id;

//     // Fetch all TAG records for the logged-in user
//     const tagRecords = await Tag.findAll({
//       where: { userId },
//       include: [
//         {  model: TagAction, as: "tagAction"  },
//         { model: User, as: "user" },
//       ],
//     });

//     // Transform the TAG records
//     const transformedTagRecords = tagRecords.map((tag) => ({
//       tagId: tag.tagId,
//       status: tag.status,
//       currentStep: tag.currentStep,
//       problem: tag.problem,
//       immediateActions: tag.immediateActions,
//       cause: tag.cause,
//       actions: tag.actions?.map(({ id, tagId, ...rest }) => rest),
//       user: {
//         firstName: tag.user.firstName,
//         lastName: tag.user.lastName,
//         image: tag.user.image,
//       },
//     }));

//     // Respond with the TAG data
//     res.status(200).json({
//       status: "success",
//       data: transformedTagRecords,
//     });
//   }
// );

export const getAllTag = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = req.query.limit ? Number(req.query.limit) : null;
  const offset = limit ? (page - 1) * limit : undefined;

  // Get total count regardless of limit for pagination info
  const count = await Tag.count();

  const tagRecords = await Tag.findAll({
    ...(limit && { limit }),
    ...(offset !== undefined && { offset }),
    include: [
      { model: TagAction, as: "tagAction" },
      { model: User, as: "user" },
    ],
  });

  const transformedTagRecords = tagRecords.map((tag) => ({
    tagId: tag.tagId,
    zone: tag.zone,
    machine: tag.machine,
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
