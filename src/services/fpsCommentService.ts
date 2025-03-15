import Fps from "../models/Fps";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import dbConnect from "../config/dbConnect";
import FpsComment from "../models/FpsComment";
import User from "../models/User";

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
