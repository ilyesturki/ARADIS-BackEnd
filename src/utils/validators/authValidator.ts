import { body } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware";
import { bodySanitizer } from "../../middlewares/sanitizer";

export const verifyTokenValidator = [
  bodySanitizer("token", "mat"),
  body("token")
    .notEmpty()
    .withMessage("Token required")
    .isString()
    .withMessage("Invalid Token"),
  body("mat")
    .notEmpty()
    .withMessage("Mat required")
    .isString()
    .withMessage("Invalid Mat"),
  validatorMiddleware,
];

export const setPasswordValidator = [
  bodySanitizer("token", "mat", "newPassword"),
  body("token")
    .notEmpty()
    .withMessage("Token required")
    .isString()
    .withMessage("Invalid Token"),
  body("mat")
    .notEmpty()
    .withMessage("Mat required")
    .isString()
    .withMessage("Invalid Mat"),
  body("newPassword").notEmpty().withMessage("New password required"),
  validatorMiddleware,
];

export const signInValidator = [
  bodySanitizer("email", "password"),
  body("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
      "i"
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long"
    ),
  validatorMiddleware,
];



export const forgetPasswordValidator = [
  bodySanitizer("email"),
  body("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address"),
  validatorMiddleware,
];

export const verifyPwResetCodeValidator = [
  bodySanitizer("email", "resetCode"),
  body("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address"),

  body("resetCode")
    .notEmpty()
    .withMessage("reset code required")
    .isNumeric()
    .withMessage("reset code must be numeric")
    .isLength({ min: 6, max: 6 })
    .withMessage("reset code must be exactly 6 digits"),

  validatorMiddleware,
];

export const resetPasswordValidator = [
  bodySanitizer("email", "password", "passwordConfirm"),
  body("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
      "i"
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long"
    )
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),

  body("passwordConfirm")
    .notEmpty()
    .withMessage("password confirmation required"),
  validatorMiddleware,
];