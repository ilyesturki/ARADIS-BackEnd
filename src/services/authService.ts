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
import { Op } from "sequelize";
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
      where: {
        mat,
        activationToken: hashedToken,
        activationTokenExpires: { [Op.gt]: new Date() }, // Ensure token is not expired
      },
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
      where: {
        mat,
        activationToken: hashedToken,
        activationTokenExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return next(new ApiError("Invalid or expired token", 400));
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();

    // Activate account
    user.status = "active";
    user.activationToken = undefined;
    user.activationTokenExpires = undefined;

    await user.save();

    // Send confirmation email
    try {
      await sendEmail(confirmationEmailTemplate(user.firstName, user.email));
    } catch (err) {
      return next(new ApiError("Error sending confirmation email", 500));
    }

    res.status(200).json({
      status: "success",
      message: "Account activated successfully.",
    });
  }
);

// @desc    Sign in user
// @route   POST /auth/signin
// @access  Public
export const signIn = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    console.log(email, password);
    const user = await User.findOne({ where: { email } });
    console.log(user);
    console.log(
      user?.password ? await bcrypt.compare(password, user.password) : ""
    );
    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(password, user.password)) ||
      user.status === "inactive"
    ) {
      return next(new ApiError("Invalid email or password", 401));
    }

    const token = generateToken(user.mat);
    const userObject = user.toJSON();
    delete userObject.password;

    res.status(200).json({ data: userObject, token });
  }
);

// @desc    Protect routes
export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization || null;
    if (!token) {
      return next(new ApiError("You are not logged in, please log in", 401));
    }

    interface DecodedTokenType {
      userId: string;
      iat: number;
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY!
    ) as DecodedTokenType;

    const user = await User.findByPk(decodedToken.userId);
    if (!user) {
      return next(new ApiError("User with this token no longer exists", 401));
    }

    req.user = user;
    next();
  }
);

// @desc    Restrict access to specific roles
export const allowedTo = (...roles: string[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user && !roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed to access this route", 403)
      );
    }
    next();
  });
