import { Request, Response, NextFunction } from 'express';

import ApiError from "../utils/ApiError";

const globalError = async (err: ApiError, req: Request, res: Response, next:NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";
  if (err.name === "JsonWebTokenError") {
    err = new ApiError("Invalid Token, please login again -.-", 401);
  }
  if (err.name === "TokenExpiredError") {
    err = new ApiError("Expired token, please login again -.-", 401);
  }
  if ((process.env.NODE_ENV = "development")) {
    devError(err, res);
  } else {
    if (err.name === "JsonWebTokenError") {
      err = new ApiError("Invalid Token, please login again -.-", 401);
    }
    if (err.name === "TokenExpiredError") {
      err = new ApiError("Expired token, please login again -.-", 401);
    }
    prodError(err, res);
  }
};

const devError = (err: ApiError,  res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    name: err.name,
    stack: err.stack,
  });
};

const prodError = (err: ApiError,  res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err.message,
  });
};

export default globalError;
