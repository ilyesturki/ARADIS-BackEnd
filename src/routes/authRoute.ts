import express from "express";
import rateLimit from "express-rate-limit";
const router = express.Router();

import {
  forgetPassword,
  protect,
  registerDeviceToken,
  removeDeviceToken,
  resetPassword,
  setPassword,
  signIn,
  verifyPwResetCode,
  verifyToken,
} from "../services/authService";
import {
  verifyTokenValidator,
  setPasswordValidator,
  signInValidator,
  forgetPasswordValidator,
  verifyPwResetCodeValidator,
  resetPasswordValidator,
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

router.post(
  "/verify-token",
  uploadUserImage,
  resizeUserImage,
  verifyTokenValidator,
  verifyToken
);
router.post(
  "/set-password",
  uploadUserImage,
  resizeUserImage,
  setPasswordValidator,
  setPassword
);
router.post("/sign-in", signInValidator, signIn);

/**
 * @route   POST /forget-password
 * @desc    Initiate password reset
 * @access  Public
 */
router.post(
  "/forget-password",
  uploadUserImage,
  resizeUserImage,
  forgetPasswordValidator,
  forgetPassword
);

/**
 * @route   POST /verify-pw-reset-code
 * @desc    Verify password reset code
 * @access  Public
 */
router.post(
  "/verify-pw-reset-code",
  uploadUserImage,
  resizeUserImage,
  verifyPwResetCodeValidator,
  verifyPwResetCode
);

/**
 * @route   PUT /reset-password
 * @desc    Reset user password
 * @access  Public
 */
router.put(
  "/reset-password",
  uploadUserImage,
  resizeUserImage,
  resetPasswordValidator,
  resetPassword
);

router.post(
  "/register-device-token",
  protect,
  uploadUserImage,
  resizeUserImage,
  registerDeviceToken
);

router.delete(
  "/remove-device-token",
  protect,
  uploadUserImage,
  resizeUserImage,
  removeDeviceToken
);


export default router;
