import { body } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware";
import { bodySanitizer } from "../../middlewares/sanitizer";

export const signUpValidator = [
  bodySanitizer(
    "name",
    "email",
    "phone",
    "password",
    "passwordConfirm",
    "address"
  ),
  body("name")
    .notEmpty()
    .withMessage("name is required")
    .isLength({ min: 3 })
    .withMessage("Too short name")
    .isLength({ max: 20 })
    .withMessage("too long name"),
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  body("phone")
    .notEmpty()
    .withMessage("phone is required")
    .isMobilePhone(["ar-TN"])
    .withMessage("Invalid phone number only accepted TN Phone numbers"),
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
  body("address")
    .optional()
    .isObject()
    .withMessage("address must be an object")
    .custom((address) => {
      const { details, governorate, city, postalCode } = address;
      if (typeof details !== "string") {
        throw new Error("details must be a string");
      }
      if (typeof governorate !== "string") {
        throw new Error("governorate must be a string");
      }
      if (typeof city !== "string") {
        throw new Error("city must be a string");
      }
      if (typeof postalCode !== "string") {
        throw new Error("postalCode must be a string");
      }

      return true;
    }),
  validatorMiddleware,
];

export const verifySignUpValidator = [
  bodySanitizer("email", "signUpCode"),
  body("email")
    .notEmpty()
    .withMessage("Email required")
    .isEmail()
    .withMessage("Invalid email address"),

  body("signUpCode")
    .notEmpty()
    .withMessage("Sign-up code required")
    .isNumeric()
    .withMessage("Sign-up code must be numeric")
    .isLength({ min: 6, max: 6 })
    .withMessage("Sign-up code must be exactly 6 digits"),

  validatorMiddleware,
];

export const providerSignInValidator = [
  bodySanitizer("provider", "providerId", "email", "name", "image"),
  body("provider").notEmpty().withMessage("Provider is required"),

  body("providerId").notEmpty().withMessage("Provider ID is required"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),
  body("name").notEmpty().withMessage("name is required"),

  body("image").optional().isString().withMessage("Image must be a string"),
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
