import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";

const sanitize = (data: any, allowedFields: string[]) => {
  return Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => allowedFields.includes(key))
      .map(([key, value]) => [key, String(value)])
  );
};

export const bodySanitizer = (...allowedFields: string[]) =>
  asyncHandler((req: Request, res: Response, next: NextFunction) => {
    req.body = sanitize(req.body, allowedFields);
    next();
  });
export const paramsSanitizer = (...allowedFields: string[]) =>
  asyncHandler((req: Request, res: Response, next: NextFunction) => {
    req.params = sanitize(req.params, allowedFields);
    next();
  });
export const querySanitizer = (...allowedFields: string[]) =>
  asyncHandler((req: Request, res: Response, next: NextFunction) => {
    req.query = sanitize(req.query, allowedFields);
    next();
  });

// import { Request, Response, NextFunction } from "express";
// import asyncHandler from "express-async-handler";

// const sanitizer = (...allowedFields: string[]) =>
//   asyncHandler((req: Request, res: Response, next: NextFunction) => {
//     const sanitizedEntries = Object.entries(req.body).filter(([key]) =>
//       allowedFields.includes(key)
//     );

//     req.body = Object.fromEntries(sanitizedEntries);
//     next();
//   });

// export default sanitizer;
