import asyncHandler from "express-async-handler";

import User, { UserType } from "../models/User";
import ApiError from "../utils/ApiError";

import { Request, Response, NextFunction } from "express";
import factory from "./factoryService";

import sendEmail from "../utils/sendEmail";
import crypto from "crypto";
import activationEmailTemplate from "../utils/emailTemplate/activationEmailTemplate ";

// @desc    Create a new user
// @route   POST /users
// @access  Admin
export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { mat, email, phone, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ mat });

    if (existingUser) {
      if (existingUser.status === "active") {
        return next(new ApiError("User already exists", 400));
      } else {
        await User.findOneAndDelete({ mat }); // Remove inactive user
      }
    }

    // Create new user (status: pending activation)
    const user = await User.create({
      mat,
      email,
      phone,
      firstName,
      lastName,
      status: "pending",
    });

    // Generate secure activation token
    const activationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(activationToken)
      .digest("hex");

    user.activationToken = hashedToken;
    user.activationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiration

    await user.save();

    // Construct the activation link
    const activationUrl = `${process.env.FRONTEND_URL}/auth/activate?token=${activationToken}`;

    // Send email
    try {
      await sendEmail(
        activationEmailTemplate(user.firstName, user.email, activationUrl)
      );
    } catch (err) {
      // Clean up token if email fails
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

// @desc    Get a list of users
// @route   GET /users
// @access  Admin
export const getUsers = factory.getAll<UserType>(User);

// @desc    Update a specific user by ID
// @route   PUT /users/:id
// @access  Private/Admin
export const updateUser = factory.updateOne<UserType>(User);

// @desc    Delete a specific user by ID
// @route   DELETE /users/:id
// @access  Private/Admin
export const deleteUser = factory.deleteOne<UserType>(User);

// @desc    Get a specific user by ID
// @route   GET /users/:id
// @access  Private/Admin
export const getUser = factory.getOne<UserType>(User);
