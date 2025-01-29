import { body, param, query } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware";
import {
  paramsSanitizer,
  querySanitizer,
  bodySanitizer,
} from "../../middlewares/sanitizer";
import User from "../../models/User";
import bcrypt from "bcrypt";
// LOGED USER ONLY
export const updateLoggedUserValidator = [
  paramsSanitizer("id"),
  bodySanitizer(
    "name",
    "email",
    "phone",
    "status",
    "address.details",
    "address.governorate",
    "address.city",
    "address.postalCode",
    "image",
    "emailProductsNotifications",
    "emailSecurityNotifications",
    "phoneSecurityNotifications"
  ),
  param("id").isMongoId().withMessage("Invalid User id format"),
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short name")
    .isLength({ max: 20 })
    .withMessage("too long name"),
  body("email").optional().isEmail().withMessage("Invalid email address"),
  body("phone")
    .optional()
    .isMobilePhone(["ar-TN"])
    .withMessage("Invalid phone number only accepted TN Phone numbers"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("status must be active or inactive"),

  body("image").optional().isString().withMessage("image must be a string"),
  body("address")
    .optional()
    .custom((address) => {
      console.log(address);
      const parsedAddress = JSON.parse(address);
      const { details, governorate, city, postalCode } = parsedAddress;
      if (details && typeof details !== "string") {
        throw new Error("details must be a string");
      }
      if (governorate && typeof governorate !== "string") {
        throw new Error("governorate must be a string");
      }
      if (city && typeof city !== "string") {
        throw new Error("city must be a string");
      }
      if (postalCode && typeof postalCode !== "string") {
        throw new Error("postalCode must be a string");
      }

      return true;
    }),
  validatorMiddleware,
];
export const updateLoggedUserPasswordValidator = [
  paramsSanitizer("id"),
  bodySanitizer("currentPassword", "password"),
  param("id").isMongoId().withMessage("Invalid User id format"),
  body("currentPassword")
    .notEmpty()
    .withMessage("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
      "i"
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long"
    )
    .custom(async (currentPassword, { req }) => {
      const user = await User.findById(req.params.id);
      if (!user.provider && !user.providerId) {
        if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
          throw new Error("Password Confirmation incorrect");
        }
      }

      return true;
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
      "i"
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long"
    ),
  validatorMiddleware,
];
export const deleteLoggedUserValidator = [
  paramsSanitizer("id"),
  bodySanitizer("password"),
  param("id").isMongoId().withMessage("Invalid User ID format"),
  body("password")
    .optional()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
      "i"
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long"
    ),
  // .custom(async (password, { req }) => {
  //   const user = await User.findById(req.params.id);
  //   if (!user.provider && !user.providerId) {
  //     if (!user || !(await bcrypt.compare(password, user.password))) {
  //       throw new Error("Password Confirmation incorrect");
  //     }
  //   }

  //   return true;
  // })
  validatorMiddleware,
];
export const getLoggedUserValidator = [
  paramsSanitizer("id"),
  param("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];

// ADMIN ONLY
export const createUserValidator = [
  bodySanitizer(
    "name",
    "email",
    "phone",
    "password",
    "passwordConfirm",
    "status",
    "address",
    "image"
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
    ),
  body("status")
    .notEmpty()
    .isIn(["active", "inactive"])
    .withMessage("status must be active or inactive"),
  body("image").optional().isString().withMessage("image must be a string"),
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
export const updateUserValidator = [
  paramsSanitizer("id"),
  bodySanitizer("name", "email", "phone", "status", "address", "image"),
  param("id").isMongoId().withMessage("Invalid User id format"),
  body("name")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Too short name")
    .isLength({ max: 20 })
    .withMessage("too long name"),
  body("email").optional().isEmail().withMessage("Invalid email address"),
  body("phone")
    .optional()
    .isMobilePhone(["ar-TN"])
    .withMessage("Invalid phone number only accepted TN Phone numbers"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("status must be active or inactive"),
  body("image").optional().isString().withMessage("image must be a string"),
  body("address")
    .optional()
    .isObject()
    .withMessage("address must be an object")
    .custom((address) => {
      const { details, governorate, city, postalCode } = address;
      if (details && typeof details !== "string") {
        throw new Error("details must be a string");
      }
      if (governorate && typeof governorate !== "string") {
        throw new Error("governorate must be a string");
      }
      if (city && typeof city !== "string") {
        throw new Error("city must be a string");
      }
      if (postalCode && typeof postalCode !== "string") {
        throw new Error("postalCode must be a string");
      }

      return true;
    }),
  validatorMiddleware,
];
export const updatePasswordValidator = [
  paramsSanitizer("id"),
  bodySanitizer("password", "passwordConfirm"),
  param("id").isMongoId().withMessage("Invalid User id format"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
      "i"
    )
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long"
    ),
  validatorMiddleware,
];
export const deleteUserValidator = [
  paramsSanitizer("id"),
  param("id").isMongoId().withMessage("Invalid User ID format"),
  validatorMiddleware,
];
export const getUserValidator = [
  paramsSanitizer("id"),
  param("id").isMongoId().withMessage("Invalid User id format"),
  validatorMiddleware,
];
export const getAllValidator = [
  querySanitizer("page", "limit", "sort", "fields", "keyword"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
  query("sort").optional().isString().withMessage("Sort must be a string"),
  query("fields").optional().isString().withMessage("Fields must be a string"),
  query("keyword")
    .optional()
    .isString()
    .withMessage("Keyword must be a string"),
  validatorMiddleware,
];
