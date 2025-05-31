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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  message: "Too many requests from this IP, please try again after 15 minutes",
});

router.use(limiter);

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

router.post(
  "/forget-password",
  uploadUserImage,
  resizeUserImage,
  forgetPasswordValidator,
  forgetPassword
);

router.post(
  "/verify-pw-reset-code",
  uploadUserImage,
  resizeUserImage,
  verifyPwResetCodeValidator,
  verifyPwResetCode
);

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
