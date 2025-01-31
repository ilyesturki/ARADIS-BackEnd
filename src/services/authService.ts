import User from "../models/User";

import crypto from "crypto";

import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

import bcrypt from "bcrypt";

import generateToken from "../utils/generateToken";
import sendEmail from "../utils/sendEmail";
import resetCodeEmailTemplate from "../utils/emailTemplate/resetCodeEmailTemplate";


import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";



export const verifySignUp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { signUpCode, email } = req.body;
    const hashedSignUpCode = crypto
      .createHash("sha256")
      .update(signUpCode)
      .digest("hex");
    const user = await User.findOne({
      email,
      signUpCode: hashedSignUpCode,
      signUpCodeExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ApiError("code invalid or expired", 400));
    }
    user.status = "active";
    await user.save();

    // const token = generateToken(user._id);
    // const userObject = user.toObject();
    // delete userObject.password;
    res.status(201).json({ status: "success", message: "user verified" });
  }
);

export const signIn = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (
      !user ||
      !(await bcrypt.compare(password, user.password)) ||
      user.status === "inactive"
    ) {
      return next(new ApiError("Invalid email or password", 401));
    }
    const token = generateToken(user._id);
    const userObject = user.toObject();
    delete userObject.password;
    res.status(200).json({ data: userObject, token });
  }
);

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization || null;
    if (!token) {
      return next(new ApiError("You are not login, please login -_-", 401));
    }

    interface decodedTokenType {
      userId: string;
      iat: number;
    }
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY
    ) as decodedTokenType;

    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return next(new ApiError("user with this token no more exist -_-", 401));
    }
    // if (decodedToken.iat < Math.trunc(user.pwUpdatedAt.getTime() / 1000)) {
    //   return next(
    //     new ApiError("user changed his password , please login again -_-", 401)
    //   );
    // }
    req.user = user;
    next();
  }
);

export const allowedTo = (...roles: string[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user && !roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });
