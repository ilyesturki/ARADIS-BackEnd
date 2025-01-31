import express from "express";
import rateLimit from "express-rate-limit";
const router = express.Router();

import { signIn } from "../services/authService";
import {
  signUpValidator,
  signInValidator,
  forgetPasswordValidator,
  verifyPwResetCodeValidator,
  resetPasswordValidator,
  verifySignUpValidator,
  providerSignInValidator,
} from "../utils/validators/authValidator";

import {
  uploadUserImage,
  resizeUserImage,
} from "../middlewares/uploadImage/uploadUserImage";

// Rate limiter middleware to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

router.use(limiter);

/**
 * @route   POST /signin
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post("/sign-in", signInValidator, signIn);

export default router;
