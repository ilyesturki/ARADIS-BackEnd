import User from "../models/User";

import crypto from "crypto";

import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

import bcrypt from "bcrypt";

import generateToken from "../utils/generateToken";
import sendEmail from "../utils/sendEmail";


import { Request, Response, NextFunction } from "express";
import ApiError from "../utils/ApiError";
import confirmationEmailTemplate from "../utils/emailTemplate/confirmationEmailTemplate";




// @desc    Verify activation token and matricule
// @route   POST /auth/verify-token
// @access  Public
export const verifyToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, mat } = req.body;

    if (!token || !mat) {
      return next(new ApiError("Invalid request parameters", 400));
    }

    // Hash the provided token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by matricule and check activation token
    const user = await User.findOne({
      mat,
      activationToken: hashedToken,
      activationTokenExpires: { $gt: Date.now() }, // Ensure token is not expired
    });

    if (!user) {
      return next(new ApiError("Invalid or expired token", 400));
    }

    res.status(200).json({
      status: "success",
      message: "Token and matricule verified. Proceed to set password.",
    });
  }
);

// @desc    Set password and activate account
// @route   POST /auth/set-password
// @access  Public
export const setPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, mat, newPassword } = req.body;

    if (!token || !mat || !newPassword) {
      return next(new ApiError("Invalid request parameters", 400));
    }

    // Hash the provided token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user by matricule and check activation token
    const user = await User.findOne({
      mat,
      activationToken: hashedToken,
      activationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ApiError("Invalid or expired token", 400));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordChangedAt = new Date();

    // Activate account
    user.status = "active";
    user.activationToken = undefined;
    user.activationTokenExpires = undefined;

    await user.save();

    // Send confirmation email
    try {
      await sendEmail(
        confirmationEmailTemplate(user.firstName, user.email)
      );
    } catch (err) {
      return next(new ApiError("Error sending confirmation email", 500));
    }

    res.status(200).json({
      status: "success",
      message: "Account activated successfully.",
    });
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
    const token = generateToken(user.mat);
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
