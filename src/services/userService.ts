import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import User, { UserType } from "../models/User";
import factory from "./factoryService";
import ApiError from "../utils/ApiError";
import sendEmail from "../utils/sendEmail";
import activationEmailTemplate from "../utils/emailTemplate/activationEmailTemplate ";


export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      mat,
      firstName,
      lastName,
      role,
      userCategory,
      userService,
      email,
      phone,
      image,
    } = req.body;

    console.log(
      mat,
      email,
      phone,
      firstName,
      lastName,
      image,
      userCategory,
      userService
    );
    const existingUser = await User.findOne({ where: { mat: mat } });

    if (existingUser) {
      if (existingUser.status === "active") {
        return next(new ApiError("User already exists", 400));
      } else {
        await existingUser.destroy(); 
      }
    }

    const user = await User.create({
      mat,
      firstName,
      lastName,
      role,
      userCategory,
      userService,
      email,
      phone,
      status: "pending",
      image,
    });

    const activationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(activationToken)
      .digest("hex");

    await user.update({
      activationToken: hashedToken,
      activationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), 
    });

    const activationUrl = `${process.env.FRONTEND_URL}/auth/activate?token=${activationToken}`;

    try {
      await sendEmail(
        activationEmailTemplate(user.firstName, user.email, activationUrl)
      );
    } catch (err) {
      user.activationToken = undefined;
      user.activationTokenExpires = undefined;

      await user.save();

      return next(new ApiError("Error sending email. Try again later.", 500));
    }

    res.status(201).json({
      status: "success",
      message: "User created. Activation email sent.",
      data: { email: user.email },
    });
  }
);

export const getUsers = factory.getAll(User);

export const updateUser = factory.updateOne(User);

export const deleteUser = factory.deleteOne(User);

export const getUser = factory.getOne(User);
