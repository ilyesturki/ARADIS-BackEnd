import Fps from "../models/Fps";
import FpsProblem from "../models/FpsProblem";
import FpsImmediateActions from "../models/FpsImmediateActions";
import FpsCause from "../models/FpsCause";
import FpsDefensiveAction from "../models/FpsDefensiveAction";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";

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
      pourqoui,
      image,
      images,
      clientRisck,
    } = req.body;
    const { id: fpsId } = req.params;

    let fps = await Fps.findOne({ where: { fpsId } });
    let fpsProblem;
    if (!fps) {
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
        pourqoui,
        image,
        images,
        clientRisck,
      });
      fps = await Fps.create({ fpsId, problemId: fpsProblem.id });
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
          pourqoui,
          image,
          images,
          clientRisck,
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
          pourqoui,
          image,
          images,
          clientRisck,
        });
        await fps.update({ problemId: fpsProblem.id });
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

// @desc    Create or update the immediate actions part in FPS
// @route   POST /fps/immediate-actions
// @access  Private
export const createOrUpdateFpsImmediateActions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      alert,
      startSorting,
      sortingResults,
      concludeFromSorting,
      immediatActions,
    } = req.body;
    const { id: fpsId } = req.params;
    const fps = await Fps.findOne({ where: { fpsId } });
    if (!fps) {
      return next(
        new ApiError("FPS record not found for the provided fpsId.", 404)
      );
    }

    let fpsImmediateActions;
    if (fps.immediatActionsId) {
      fpsImmediateActions = await FpsImmediateActions.findByPk(
        fps.immediatActionsId
      );
      if (fpsImmediateActions) {
        await fpsImmediateActions.update({
          alert,
          startSorting,
          sortingResults,
          concludeFromSorting,
          immediatActions,
        });
      }
    }

    if (!fpsImmediateActions) {
      fpsImmediateActions = await FpsImmediateActions.create({
        alert,
        startSorting,
        sortingResults,
        concludeFromSorting,
        immediatActions,
      });
      await fps.update({ immediatActionsId: fpsImmediateActions.id });
    }

    // Step 5: Respond with the FPS immediate actions data
    res.status(201).json({
      status: "success",
      message: "Immediate actions created or updated successfully.",
      data: {
        fpsId: fps.fpsId,
        immediateActions: fpsImmediateActions,
      },
    });
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
      await fps.update({ causeId: fpsCause.id });
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

export const createOrUpdateFpsDefensiveActions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { defensiveActions } = req.body;
    const { id: fpsId } = req.params;
    const fps = await Fps.findOne({ where: { fpsId } });
    if (!fps) {
      return next(
        new ApiError("FPS record not found for the provided fpsId.", 404)
      );
    }

    if (!Array.isArray(defensiveActions)) {
      return next(new ApiError("Defensive actions must be an array.", 400));
    }

    // Fetch existing defensive actions linked to this FPS
    const existingActions = await FpsDefensiveAction.findAll({
      where: { fpsId: fps.id },
    });

    const existingIds = new Set(existingActions.map((action) => action.id));
    const receivedIds = new Set(
      defensiveActions.map((action) => action.id).filter(Boolean)
    );

    // Delete actions that are no longer in the request
    const actionsToDelete = existingActions.filter(
      (action) => !receivedIds.has(action.id)
    );
    await Promise.all(actionsToDelete.map((action) => action.destroy()));

    // Create or update defensive actions
    const updatedDefensiveActions = await Promise.all(
      defensiveActions.map(async (action) => {
        const { id, procedure, userCategory, userService, quand } = action;

        if (id && existingIds.has(id)) {
          const existingAction = await FpsDefensiveAction.findByPk(id);
          if (existingAction) {
            return await existingAction.update({
              procedure,
              userCategory,
              userService,
              quand,
            });
          }
        }

        return await FpsDefensiveAction.create({
          procedure,
          userCategory,
          userService,
          quand,
          fpsId: fps.id,
        });
      })
    );

    res.status(201).json({
      status: "success",
      message: "Defensive actions created, updated, or deleted successfully.",
      data: {
        fpsId: fps.fpsId,
        defensiveActions: updatedDefensiveActions,
      },
    });
  }
);
