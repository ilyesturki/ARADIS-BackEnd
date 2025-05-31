import { Request, Response, NextFunction } from "express";
import ApiFeatures from "../utils/ApiFeatures";
import asyncHandler from "express-async-handler";
import { ModelStatic, FindOptions, Model } from "sequelize";
import ApiError from "../utils/ApiError";
import extractNonEmptyFields from "../utils/extractNonEmptyFields";
import parseArrays from "../utils/parseArray";

export const createOne = <T extends Model>(
  Model: ModelStatic<T> 
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parsedArr = parseArrays(req, [
      "colors",
      "sizes",
      "images",
      "address",
    ]);

    const newDoc = await Model.create({
      ...req.body,
      ...parsedArr,
    });

    res.status(201).json({ data: newDoc });
  });

export const getAll = <T extends Model>(
  Model: ModelStatic<T> 
) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const apiFeatures = new ApiFeatures<T>(req.query);

    apiFeatures.filter().search(Model).sort().limitFields();

    const totalCount = await Model.count({
      where: apiFeatures.queryOptions.where,
    });

    apiFeatures.paginate(totalCount);

    const documents = await Model.findAll(
      apiFeatures.queryOptions as FindOptions
    );

    res.status(200).json({
      results: documents.length,
      paginationResult: apiFeatures.paginationResult,
      data: documents,
    });
  });

export const updateOne = <T extends Model>(Model: ModelStatic<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let { id } = req.params;

    const parsedArr = parseArrays(req, ["images"]);
    console.log(req.body);
    console.log(parsedArr);

    const notEmptyData = extractNonEmptyFields<T>(
      { ...req.body, ...parsedArr },
      Model
    );
    const document = await Model.findByPk(id);

    if (!document) {
      return next(
        new ApiError(`No ${Model.name} found for this id ${id}`, 404)
      );
    }

    await document.update({
      ...notEmptyData,
    });

    res.status(200).json({ data: document });
  });

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

export const getOne = <T extends Model>(Model: ModelStatic<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

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
