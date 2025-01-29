import { Request, Response, NextFunction } from "express";
import ApiFeatures from "../utils/ApiFeatures";
import asyncHandler from "express-async-handler";
import { Model as MongooseModel, Document, FilterQuery } from "mongoose";
import ApiError from "../utils/ApiError";
import extractNonEmptyFields from "../utils/extractNonEmptyFields";
import parseArrays from "../utils/parseArray";

// Create a new document
export const createOne = <T extends Document>(Model: MongooseModel<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parsedArr = parseArrays(req, [
      "colors",
      "sizes",
      "images",
      "address",
    ]);

    const newDoc = await Model.create({ ...req.body, ...parsedArr });
    res.status(201).json({ data: newDoc });
  });

// Update an existing document by ID
export const updateOne = <T extends Document>(
  Model: MongooseModel<T>,
  addressFields: string[] = []
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let { id } = req.params;
    // if (!id) {
    //   id = req.body.userId;
    // }
    const parsedArr = parseArrays(req, ["colors", "sizes", "images"]);
    console.log(req.body);
    console.log(parsedArr);

    // Extract address fields if provided
    const addressData = addressFields.reduce((acc, field) => {
      acc[field] = req.body[field];

      return acc;
    }, {} as Record<string, any>);

    const notEmptyData = extractNonEmptyFields<T>(
      { ...req.body, ...parsedArr },
      Model
    );
    console.log(notEmptyData);
    const document = await Model.findByIdAndUpdate(
      id,
      {
        $set: {
          ...notEmptyData,
          ...addressData,
        },
      },
      {
        new: true,
      }
    );

    if (!document) {
      return next(new ApiError(`No ${Model.modelName} for this id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

// Delete a document by ID
export const deleteOne = <T extends Document>(Model: MongooseModel<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No ${Model.modelName} for this id ${id}`, 404));
    }
    res.status(204).send();
  });

// Get all documents with optional filtering, pagination, etc.
export const getAll = <T extends Document>(Model: MongooseModel<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // let filter: FilterQuery<T> = {};
    // if (req.filterObj) {
    //   filter = req.filterObj;
    // }

    const apiFeatures = new ApiFeatures(Model.find(), req.query)

      .filter()
      .search(Model.modelName)
      .limitFields()
      .sort();

    // Count documents after filter and search
    const filteredDocumentsQuery = apiFeatures.mongooseQuery.clone();
    const documentsCount = await filteredDocumentsQuery.countDocuments();

    // Apply pagination after count
    apiFeatures.paginate(documentsCount);

    const documents = await apiFeatures.mongooseQuery;

    res.status(200).json({
      results: documents.length,
      paginationResult: apiFeatures.paginationResult,
      data: documents,
    });
  });

// Get a single document by ID
export const getOne = <T extends Document>(Model: MongooseModel<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    let document;
    // if (Model.modelName === "User") {
    //   document = await Model.findById(id).populate("basket");
    // } else {
    document = await Model.findById(id);
    // }
    if (!document) {
      return next(new ApiError(`No ${Model.modelName} for this id ${id}`, 404));
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
