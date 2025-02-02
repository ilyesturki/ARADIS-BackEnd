import { Request, Response, NextFunction } from "express";
import ApiFeatures from "../utils/ApiFeatures";
import asyncHandler from "express-async-handler";
// import { Model as MongooseModel, Document, FilterQuery } from "mongoose";
import { ModelStatic, FindOptions, Model } from "sequelize";
import ApiError from "../utils/ApiError";
import extractNonEmptyFields from "../utils/extractNonEmptyFields";
import parseArrays from "../utils/parseArray";

// Create a new document
export const createOne = <T extends Model>(
  Model: ModelStatic<T> // Use ModelStatic for Sequelize model classes
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parsedArr = parseArrays(req, [
      "colors",
      "sizes",
      "images",
      "address",
    ]);

    // Create a new document with Sequelize's `create` method
    const newDoc = await Model.create({
      ...req.body,
      ...parsedArr,
    });

    res.status(201).json({ data: newDoc });
  });

// Get all documents with optional filtering, pagination, etc.
export const getAll = <T extends Model>(
  Model: ModelStatic<T> // Use ModelStatic instead of ModelCtor
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const apiFeatures = new ApiFeatures<T>(req.query);

    // Apply filtering, sorting, searching, and pagination
    apiFeatures.filter().search(Model).sort().limitFields();

    // Count documents after filtering
    const totalCount = await Model.count({
      where: apiFeatures.queryOptions.where,
    });

    // Apply pagination after counting
    apiFeatures.paginate(totalCount);

    // Fetch records
    const documents = await Model.findAll(
      apiFeatures.queryOptions as FindOptions
    );

    res.status(200).json({
      results: documents.length,
      paginationResult: apiFeatures.paginationResult,
      data: documents,
    });
  });

// Update an existing document by ID
export const updateOne = <T extends Model>(Model: ModelStatic<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let { id } = req.params;

    // Parse arrays (e.g., colors, sizes, images)
    const parsedArr = parseArrays(req, ["images"]);
    console.log(req.body);
    console.log(parsedArr);

    // Filter out empty fields
    const notEmptyData = extractNonEmptyFields<T>(
      { ...req.body, ...parsedArr },
      Model
    );
    console.log(notEmptyData);

    // Find the document by ID
    const document = await Model.findByPk(id);

    if (!document) {
      return next(
        new ApiError(`No ${Model.name} found for this id ${id}`, 404)
      );
    }

    // Update the document
    await document.update({
      ...notEmptyData,
    });

    res.status(200).json({ data: document });
  });

// Delete a document by ID
export const deleteOne = <T extends Model>(Model: ModelStatic<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const document = await Model.findByPk(id);

    if (!document) {
      return next(
        new ApiError(`No ${Model.name} found for this id ${id}`, 404)
      );
    }

    await document.destroy();
    res.status(204).send();
  });

// Get a single document by ID
export const getOne = <T extends Model>(Model: ModelStatic<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Fetch the document by primary key
    const document = await Model.findByPk(id);

    if (!document) {
      return next(
        new ApiError(`No ${Model.name} found for this id ${id}`, 404)
      );
    }

    res.status(200).json({ data: document });
  });

export default {
  createOne,
  updateOne,
  deleteOne,
  getOne,
  getAll,
};
