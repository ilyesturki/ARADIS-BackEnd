import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import User, { UserType } from "../models/User";
import factory from "./factoryService";
import ApiError from "../utils/ApiError";
import sendEmail from "../utils/sendEmail";
import activationEmailTemplate from "../utils/emailTemplate/activationEmailTemplate ";

// @desc    Create a new user
// @route   POST /users
// @access  Admin
export const createUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { mat,firstName, lastName,role, email, phone,  image } = req.body;
   
    console.log(mat, email, phone, firstName, lastName, image);
    // Check if user already exists
    const existingUser = await User.findOne({ where: { mat: mat } });

    if (existingUser) {
      if (existingUser.status === "active") {
        return next(new ApiError("User already exists", 400));
      } else {
        await existingUser.destroy(); // Remove inactive user
      }
    }

    // Create new user (status: pending activation)
    const user = await User.create({
      mat,
      firstName,
      lastName,
      role,
      email,
      phone,
      status: "pending",
      image,
    });

    // Generate secure activation token
    const activationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(activationToken)
      .digest("hex");

    await user.update({
      activationToken: hashedToken,
      activationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiration
    });

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
export const getUsers = factory.getAll(User);

// @desc    Update a specific user by ID
// @route   PUT /users/:id
// @access  Private/Admin
export const updateUser = factory.updateOne(User);

// @desc    Delete a specific user by ID
// @route   DELETE /users/:id
// @access  Private/Admin
export const deleteUser = factory.deleteOne(User);

// @desc    Get a specific user by ID
// @route   GET /users/:id
// @access  Private/Admin
export const getUser = factory.getOne(User);
