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
import resetCodeEmailTemplate from "../utils/emailTemplate/resetCodeEmailTemplate";
import DeviceToken from "../models/DeviceToken";


export const registerDeviceToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, userId, deviceInfo } = req.body;
      await DeviceToken.create({
        token,
        userId,
        deviceInfo,
        isActive: true,
        provider: "expo",
      });
  
      res.status(200).json({ message: "Token registered" });
  }
);

export const removeDeviceToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.body;


    const existing = await DeviceToken.findOne({ where: { token } });

    if (!existing) {
      return next(
        new ApiError("Token not found", 404)
      );
    }

    await existing.destroy(); 

    res.status(200).json({ message: "Token removed" });
  }
);


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
    // password = await bcrypt.hash(instance.password, 10);
    user.password = await bcrypt.hash(newPassword, 10);
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
    const user = await User.findOne({ where: { email } });
    console.log(email, password);
    console.log(user);
    console.log("/////");
    console.log(user?.dataValues);
    console.log("/////");
    console.log(user?.dataValues?.password);
    console.log("/////");
    // console.log(await bcrypt.compare(password, user?.dataValues?.password));
    if (
      !user ||
      !user?.dataValues?.password ||
      !(await bcrypt.compare(password, user?.dataValues?.password)) ||
      user.status !== "active"
    ) {
      return next(new ApiError("Invalid email or password", 401));
    }

    const token = generateToken(user.dataValues.id);

    const { password: _, ...userObject } = user.dataValues;

    res.status(200).json({ data: userObject, token });
  }
);

export const forgetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || user.status === "inactive") {
      return next(new ApiError("There is no user with this email", 400));
    }

    const resetCode = Math.floor(Math.random() * 900000 + 100000).toString();
    const hashedResetCode = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");

    await user.update({
      pwResetCode: hashedResetCode,
      pwResetExpires: new Date(Date.now() + 10 * 60 * 1000),
      pwResetVerified: false,
    });

    try {
      await sendEmail(
        resetCodeEmailTemplate(user.firstName, user.email, resetCode)
      );
    } catch (err) {
      await user.update({
        pwResetCode: null,
        pwResetExpires: null,
        pwResetVerified: null,
      });
      return next(new ApiError("There is an error in sending email", 500));
    }

    res
      .status(200)
      .json({ status: "success", message: "Reset code sent to email" });
  }
);

export const verifyPwResetCode = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, resetCode } = req.body;
    const hashedResetCode = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");

    const user = await User.findOne({
      where: {
        email,
        pwResetCode: hashedResetCode,
        pwResetExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return next(new ApiError("Reset code invalid or expired", 400));
    }

    await user.update({ pwResetVerified: true });
    res.status(200).json({ status: "success", message: "Correct reset code" });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return next(new ApiError("There is no user with this email", 404));
    }

    if (!user.pwResetVerified) {
      return next(new ApiError("Reset code not verified", 400));
    }

    // const hashedPassword = await bcrypt.hash(password, +process.env.BCRYPT_SALT);
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({
      password: hashedPassword,
      pwUpdatedAt: new Date(),
      pwResetCode: null,
      pwResetExpires: null,
      pwResetVerified: null,
    });

    res
      .status(200)
      .json({ status: "success", message: "Password reset successful" });
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
      id: string;
      iat: number;
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY!
    ) as DecodedTokenType;

    const user = await User.findByPk(decodedToken.id);

    console.log("***********");
    console.log(token);
    console.log(decodedToken);
    console.log(user);
    console.log("***********");
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
