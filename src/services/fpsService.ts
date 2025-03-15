import Fps from "../models/Fps";
import FpsProblem from "../models/FpsProblem";
import FpsImmediateActions from "../models/FpsImmediateActions";
import FpsCause from "../models/FpsCause";
import FpsDefensiveAction from "../models/FpsDefensiveAction";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import SortingResults from "../models/SortingResults";
import ImmediateActions from "../models/ImmediateActions";
import dbConnect from "../config/dbConnect";
import {
  ImmediatActionsType,
  SortingResultsType,
} from "../types/FpsImmediateActionsType";
import { FpsDefensiveActionType } from "../types/FpsDefensiveActionType";
import FpsComment from "../models/FpsComment";
import User from "../models/User";
import { createQRCode } from "../utils/createQRCode";
import FpsHelper from "../models/FpsHelper";
const sequelize = dbConnect();

// @desc    Create or update the problem part in FPS
// @route   POST /fps/problem
// @access  Private
export const createOrUpdateFpsProblem = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      type,
      quoi,
      ref,
      quand,
      ou,
      userCategory,
      userService,
      comment,
      combien,
      pourquoi,
      image,
      images,
      clientRisk,
    } = req.body;
    const { id: fpsId } = req.params;
    const userId = req.user?.id;

    const newImage = image ? image : null;
    const newImages = images ? images : null;

    let fps = await Fps.findOne({ where: { fpsId } });
    let fpsProblem;
    if (!fps) {
      // Generate the QR code and upload to Cloudinary
      const qrCodeUrl = await createQRCode(fpsId); // Save QR code URL from Cloudinary

      fpsProblem = await FpsProblem.create({
        type,
        quoi,
        ref,
        quand,
        ou,
        userCategory,
        userService,
        comment,
        combien,
        pourquoi,
        image: newImage,
        images: newImages,
        clientRisk,
      });
      fps = await Fps.create({
        fpsId,
        problemId: fpsProblem.id,
        currentStep: "problem",
        userId,
        qrCodeUrl, // Save the QR code URL
      });
    } else {
      fpsProblem = await FpsProblem.findByPk(fps.problemId);
      if (fpsProblem) {
        await fpsProblem.update({
          type,
          quoi,
          ref,
          quand,
          ou,
          userCategory,
          userService,
          comment,
          combien,
          pourquoi,
          image: newImage,
          images: newImages,
          clientRisk,
        });
      }
      if (!fpsProblem) {
        fpsProblem = await FpsProblem.create({
          type,
          quoi,
          ref,
          quand,
          ou,
          userCategory,
          userService,
          comment,
          combien,
          pourquoi,
          image: newImage,
          images: newImages,
          clientRisk,
        });
        await fps.update({ problemId: fpsProblem.id, currentStep: "problem" });
      }
      // Update FPS record (if the QR code hasn't been generated yet)
      if (!fps.qrCodeUrl) {
        const qrCodeUrl = await createQRCode(fpsId); // Generate QR code if it's not already saved
        await fps.update({ qrCodeUrl });
      }
    }

    res.status(201).json({
      status: "success",
      message: "Fps problem created or updated successfully.",
      data: {
        fpsId: fps.fpsId,
        problem: fpsProblem,
      },
    });
  }
);

export const createOrUpdateFpsImmediateActions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      alert,
      startSorting,
      sortingResults,
      concludeFromSorting,
      immediateActions,
    } = req.body;
    const { id: fpsId } = req.params;

    const transaction = await sequelize.transaction();

    const alertArr = JSON.parse(alert);
    try {
      // Check if FPS exists
      const fps = await Fps.findOne({ where: { fpsId } });
      if (!fps) {
        throw new ApiError("FPS record not found for the provided fpsId.", 404);
      }

      // Add helpers (users) based on the alert category
      for (const category of alertArr) {
        const usersInCategory = await User.findAll({
          where: { userService: category, userCategory: "midel-management" }, // Filter users by category
        });

        for (const user of usersInCategory) {
          // Add each user as a helper for this FPS
          await FpsHelper.create({
            fpsId: fps.fpsId,
            userId: user.id,
            scanStatus: "notScanned", // Initial status
          });
        }
      }

      // Find or create FPS Immediate Actions
      let fpsImmediateActions = await FpsImmediateActions.findByPk(
        fps.immediatActionsId
      );

      if (fpsImmediateActions) {
        await fpsImmediateActions.update(
          { alert: alertArr, startSorting, concludeFromSorting },
          { transaction }
        );

        // Remove old SortingResults & ImmediateActions
        await SortingResults.destroy({
          where: { immediateActionsId: fpsImmediateActions.id },
          transaction,
        });
        await ImmediateActions.destroy({
          where: { immediateActionsId: fpsImmediateActions.id },
          transaction,
        });
      } else {
        fpsImmediateActions = await FpsImmediateActions.create(
          { alert: alertArr, startSorting, concludeFromSorting },
          { transaction }
        );
        await fps.update(
          { immediatActionsId: fpsImmediateActions.id },
          { transaction }
        );
      }

      // Parse and insert Sorting Results
      try {
        const sortingResultsArr = JSON.parse(sortingResults);
        if (Array.isArray(sortingResultsArr) && sortingResultsArr.length) {
          await SortingResults.bulkCreate(
            sortingResultsArr.map(
              ({
                product,
                sortedQuantity,
                quantityNOK,
                userCategory,
                userService,
              }) => ({
                immediateActionsId: fpsImmediateActions!.id,
                product,
                sortedQuantity,
                quantityNOK,
                userCategory,
                userService,
              })
            ),
            { transaction }
          );
        }
      } catch (error) {
        throw new ApiError("Invalid format for sortingResults.", 400);
      }

      // Parse and insert Immediate Actions
      try {
        const immediateActionsArr = JSON.parse(immediateActions);
        if (Array.isArray(immediateActionsArr) && immediateActionsArr.length) {
          await ImmediateActions.bulkCreate(
            immediateActionsArr.map(
              ({ description, userCategory, userService }) => ({
                immediateActionsId: fpsImmediateActions!.id,
                description,
                userCategory,
                userService,
              })
            ),
            { transaction }
          );
        }
      } catch (error) {
        throw new ApiError("Invalid format for immediateActions.", 400);
      }

      // Update FPS current step
      await fps.update({ currentStep: "immediateActions" }, { transaction });

      // Commit transaction
      await transaction.commit();

      res.status(201).json({
        status: "success",
        message: "Immediate actions created or updated successfully.",
        data: { fpsImmediateActions },
      });
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
);

// @desc    Create or update the cause part in FPS
// @route   POST /fps/cause
// @access  Private
export const createOrUpdateFpsCause = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { causeList, whyList } = req.body;
    const { id: fpsId } = req.params;
    const fps = await Fps.findOne({ where: { fpsId } });
    if (!fps) {
      return next(
        new ApiError("FPS record not found for the provided fpsId.", 404)
      );
    }

    let fpsCause;
    if (fps.causeId) {
      fpsCause = await FpsCause.findByPk(fps.causeId);
      if (fpsCause) {
        await fpsCause.update({ causeList, whyList });
      }
    }

    if (!fpsCause) {
      fpsCause = await FpsCause.create({ causeList, whyList });
      await fps.update({ causeId: fpsCause.id, currentStep: "cause" });
    } else {
      await fps.update({ currentStep: "cause" }); // Update the currentStep
    }

    res.status(201).json({
      status: "success",
      message: "Cause created or updated successfully.",
      data: {
        fpsId: fps.fpsId,
        cause: fpsCause,
      },
    });
  }
);

// @desc    Create or update the defensive actions part in FPS
// @route   POST /fps/defensive-actions
// @access  Private

// export const createOrUpdateFpsDefensiveActions = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const { id: fpsId } = req.params;
//     let defensiveActionsArr;

//     try {
//       defensiveActionsArr = JSON.parse(req.body.defensiveActions);
//     } catch (error) {
//       return next(
//         new ApiError("Invalid JSON format in defensiveActions.", 400)
//       );
//     }

//     if (!Array.isArray(defensiveActionsArr)) {
//       return next(new ApiError("Defensive actions must be an array.", 400));
//     }

//     const fps = await Fps.findOne({ where: { fpsId } });
//     if (!fps) {
//       return next(
//         new ApiError("FPS record not found for the provided fpsId.", 404)
//       );
//     }

//     const transaction = await sequelize.transaction();

//     try {
//       // Get existing actions linked to this FPS
//       const existingActions = await FpsDefensiveAction.findAll({
//         where: { fpsId: fps.fpsId },
//         transaction,
//       });

//       const existingIds = new Set(existingActions.map((action) => action.id));
//       const receivedIds = new Set(
//         defensiveActionsArr.map((action) => action.id).filter(Boolean)
//       );

//       // Bulk delete actions that are no longer in the request
//       await FpsDefensiveAction.destroy({
//         where: {
//           id: Array.from(existingIds).filter((id) => !receivedIds.has(id)),
//         },
//         transaction,
//       });

//       // Bulk create or update defensive actions
//       await FpsDefensiveAction.bulkCreate(
//         defensiveActionsArr.map(
//           ({ id, procedure, userCategory, userService, quand }) => ({
//             id,
//             procedure,
//             userCategory,
//             userService,
//             quand,
//             fpsId: fps.fpsId,
//           })
//         ),
//         {
//           updateOnDuplicate: [
//             "procedure",
//             "userCategory",
//             "userService",
//             "quand",
//           ],
//           transaction,
//         }
//       );

//       // Update FPS current step
//       await fps.update({ currentStep: "defensiveActions" }, { transaction });

//       await transaction.commit();

//       res.status(201).json({
//         status: "success",
//         message: "Defensive actions created, updated, or deleted successfully.",
//         data: {
//           fpsId: fps.fpsId,
//           defensiveActions: defensiveActionsArr,
//         },
//       });
//     } catch (error) {
//       await transaction.rollback();
//       next(
//         new ApiError(
//           "An error occurred while processing defensive actions.",
//           500
//         )
//       );
//     }
//   }
// );
export const createOrUpdateFpsDefensiveActions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: fpsId } = req.params;
    let defensiveActionsArr;

    try {
      defensiveActionsArr = JSON.parse(req.body.defensiveActions);
    } catch (error) {
      return next(
        new ApiError("Invalid JSON format in defensiveActions.", 400)
      );
    }

    if (!Array.isArray(defensiveActionsArr)) {
      return next(new ApiError("Defensive actions must be an array.", 400));
    }

    const fps = await Fps.findOne({ where: { fpsId } });
    if (!fps) {
      return next(
        new ApiError("FPS record not found for the provided fpsId.", 404)
      );
    }

    const transaction = await sequelize.transaction();

    try {
      // Delete all existing defensive actions for this FPS
      await FpsDefensiveAction.destroy({
        where: { fpsId: fps.fpsId },
        transaction,
      });

      // Bulk insert new defensive actions
      await FpsDefensiveAction.bulkCreate(
        defensiveActionsArr.map(
          ({ procedure, userCategory, userService, quand }) => ({
            procedure,
            userCategory,
            userService,
            quand,
            fpsId: fps.fpsId,
          })
        ),
        { transaction }
      );

      // Update FPS current step
      await fps.update({ currentStep: "defensiveActions" }, { transaction });

      await transaction.commit();

      res.status(201).json({
        status: "success",
        message: "Defensive actions recreated successfully.",
        data: {
          fpsId: fps.fpsId,
          defensiveActions: defensiveActionsArr,
        },
      });
    } catch (error) {
      await transaction.rollback();
      next(
        new ApiError(
          "An error occurred while recreating defensive actions.",
          500
        )
      );
    }
  }
);

// @desc    Create or update the cause part in FPS
// @route   POST /fps/cause
// @access  Private
export const createFpsValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const { id: fpsId } = req.params;
    const fps = await Fps.findOne({ where: { fpsId } });
    if (!fps) {
      return next(
        new ApiError("FPS record not found for the provided fpsId.", 404)
      );
    }

    await fps.update({ status, currentStep: "validation" });

    res.status(201).json({
      status: "success",
      message: "Status updated successfully.",
      data: {
        fpsId: fps.fpsId,
      },
    });
  }
);

// Create a new comment
export const createComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, comment, date, rating } = req.body;
    const { id: fpsId } = req.params;

    const fps = await Fps.findOne({ where: { fpsId } });
    if (!fps) {
      return next(
        new ApiError("FPS record not found for the provided fpsId.", 404)
      );
    }

    const newComment = await FpsComment.create({
      fpsId,
      userId,
      comment,
      date,
      rating,
    });

    const commentWithUser = await FpsComment.findOne({
      where: { id: newComment.id },
      include: [{ model: User, as: "user" }],
    });

    res.status(201).json({
      status: "success",
      message: "Comment created successfully.",
      data: commentWithUser,
    });
  }
);

// Update an existing comment
export const updateComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { comment, rating } = req.body;
    const commentToUpdate = await FpsComment.findByPk(id);
    if (!commentToUpdate) {
      return next(new ApiError("Comment not found", 404));
    }
    await commentToUpdate.update({ comment, rating });

    const commentWithUser = await FpsComment.findOne({
      where: { id: commentToUpdate.id },
      include: [{ model: User, as: "user" }],
    });

    res.status(200).json({
      status: "success",
      message: "Comment updated successfully.",
      data: commentWithUser,
    });
  }
);

// Delete a comment
export const deleteComment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const commentToDelete = await FpsComment.findByPk(id);
    if (!commentToDelete) {
      return next(new ApiError("Comment not found", 404));
    }
    await commentToDelete.destroy();
    res.status(200).json({
      status: "success",
      message: "Comment deleted successfully.",
    });
  }
);

export const getAllCommentByFps = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: fpsId } = req.params;
    const fps = await Fps.findOne({ where: { fpsId } });
    if (!fps) {
      return next(
        new ApiError("FPS record not found for the provided fpsId.", 404)
      );
    }
    const comments = await FpsComment.findAll({
      where: { fpsId },
      include: [{ model: User, as: "user" }],
    });

    res.status(200).json({
      status: "success",
      message: "Comments fetched successfully.",
      data: comments,
    });
  }
);

// @desc    Get FPS by fpsId
// @route   GET /fps/:fpsId
// @access  Private
export const getFpsByFpsId = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id: fpsId } = req.params;
    const userId = req.user?.id;

    // Find the FPS record
    const fps = await Fps.findOne({
      where: { fpsId },
      include: [
        { model: FpsProblem, as: "problem" },
        {
          model: FpsImmediateActions,
          as: "immediateActions",
          include: [SortingResults, ImmediateActions],
        },
        { model: FpsCause, as: "cause" },
        { model: FpsDefensiveAction, as: "defensiveActions" },
      ],
    });

    // If FPS record is not found, throw an error
    if (!fps) {
      return next(
        new ApiError("FPS record not found for the provided fpsId.", 404)
      );
    }

    // Check if the user has access to the FPS record
    // if (fps.userId !== userId ) {
    //   return next(
    //     new ApiError("You do not have access to this FPS record.", 403)
    //   );
    // }

    // Convert Sequelize object to plain JSON to avoid circular structure errors
    const JSONFps = fps.toJSON();

    // Transform the data to exclude IDs and timestamps
    const transformedFps = {
      fpsId: JSONFps.fpsId,
      status: JSONFps.status,
      currentStep: JSONFps.currentStep,
      problem: JSONFps.problem,
      immediateActions: JSONFps.immediateActions
        ? {
            alert: JSONFps.immediateActions.alert,
            startSorting: JSONFps.immediateActions.startSorting,
            concludeFromSorting: JSONFps.immediateActions.concludeFromSorting,
            sortingResults:
              JSONFps.immediateActions.sortingResults?.map(
                ({
                  product,
                  quantityNOK,
                  sortedQuantity,
                  userCategory,
                  userService,
                }: SortingResultsType) => ({
                  product,
                  quantityNOK,
                  sortedQuantity,
                  userCategory,
                  userService,
                })
              ) || [],
            immediateActions:
              JSONFps.immediateActions.immediateActions?.map(
                ({
                  description,
                  userCategory,
                  userService,
                }: ImmediatActionsType) => ({
                  description,
                  userCategory,
                  userService,
                })
              ) || [],
          }
        : null,
      cause: JSONFps.cause,
      defensiveActions:
        JSONFps.defensiveActions?.map(
          ({
            procedure,
            userCategory,
            userService,
            quand,
          }: FpsDefensiveActionType) => {
            return { procedure, userCategory, userService, quand };
          }
        ) || [],
    };

    // Respond with the FPS data
    res.status(200).json({
      status: "success",
      data: transformedFps,
    });
  }
);

// @desc    Get all FPS records for the logged-in user
// @route   GET /fps
// @access  Private
export const getAllFpsForUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    // Fetch all FPS records for the logged-in user
    const fpsRecords = await Fps.findAll({
      where: { userId },
      include: [
        { model: FpsProblem, as: "problem" },
        {
          model: FpsImmediateActions,
          as: "immediateActions",
          include: [SortingResults, ImmediateActions],
        },
        { model: FpsCause, as: "cause" },
        { model: FpsDefensiveAction, as: "defensiveActions" },
      ],
    });

    // Transform the FPS records
    const transformedFpsRecords = fpsRecords.map((fps) => ({
      fpsId: fps.fpsId,
      currentStep: fps.currentStep,
      problem: fps.problem,
      immediateActions: fps.immediateActions,
      cause: fps.cause,
      defensiveActions: fps.defensiveActions?.map(
        ({ id, fpsId, ...rest }) => rest
      ),
    }));

    // Respond with the FPS data
    res.status(200).json({
      status: "success",
      data: transformedFpsRecords,
    });
  }
);

export const getAllFps = asyncHandler(async (req: Request, res: Response) => {
  const fpsRecords = await Fps.findAll({
    include: [
      { model: FpsProblem, as: "problem" },
      {
        model: FpsImmediateActions,
        as: "immediateActions",
        include: [SortingResults, ImmediateActions],
      },
      { model: FpsCause, as: "cause" },
      { model: FpsDefensiveAction, as: "defensiveActions" },
    ],
  });

  // Transform the FPS records
  const transformedFpsRecords = fpsRecords.map((fps) => ({
    fpsId: fps.fpsId,
    currentStep: fps.currentStep,
    problem: fps.problem,
    immediateActions: fps.immediateActions,
    cause: fps.cause,
    defensiveActions: fps.defensiveActions?.map(
      ({ id, fpsId, ...rest }) => rest
    ),
  }));

  // Respond with the FPS data
  res.status(200).json({
    status: "success",
    data: transformedFpsRecords,
  });
});

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
      fpsId: fps.fpsId,
      email: fps.user.email,
      firstName: fps.user.firstName,
      lastName: fps.user.lastName,
      scanStatus: fps.scanStatus,
      Image: fps.user.image,
    }));
    console.log(transformedSelectedUsersForFps);

    // Respond with the FPS data
    res.status(200).json({
      status: "success",
      data: transformedSelectedUsersForFps,
    });
  }
);
