import { body, param, query } from "express-validator";
import validatorMiddleware from "../../middlewares/validatorMiddleware";
import {
  paramsSanitizer,
  querySanitizer,
  bodySanitizer,
} from "../../middlewares/sanitizer";
import User from "../../models/User";
import bcrypt from "bcrypt";
import { RequestHandler } from "express";
// LOGED USER ONLY
export const updateLoggedUserValidator = [
  paramsSanitizer("id"),
  bodySanitizer("name", "email", "phone", "status", "image"),
  param("id").notEmpty().withMessage("id is required"),
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
export const deleteLoggedUserValidator = [
  paramsSanitizer("id"),
  bodySanitizer("password"),
  param("id").notEmpty().withMessage("id is required"),
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
export const getLoggedUserValidator: RequestHandler[] = [
  paramsSanitizer("id"),
  param("id").notEmpty().withMessage("id is required"),
  validatorMiddleware,
];

// ADMIN ONLY
export const createUserValidator = [
  bodySanitizer(
    "mat",
    "firstName",
    "lastName",
    "email",
    "phone",
    "role",
    "userCategory",
    "userService",
    "image"
  ),
  body("mat")
    .notEmpty()
    .withMessage("mat is required")
    .isLength({ min: 8, max: 8 })
    .withMessage("mat must be 8 characters long"),
  body("firstName")
    .notEmpty()
    .withMessage("firstName is required")
    .isLength({ min: 3 })
    .withMessage("Too short firstName")
    .isLength({ max: 20 })
    .withMessage("too long firstName"),
  body("lastName")
    .notEmpty()
    .withMessage("lastName is required")
    .isLength({ min: 3 })
    .withMessage("Too short lastName")
    .isLength({ max: 20 })
    .withMessage("too long lastName"),
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

  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("role must be user or admin"),
  body("userCategory")
    .optional()
    .isIn(["corporaite", "top-management", "midel-management", "operational"])
    .withMessage("select a valid user category"),
  body("userService")
    .optional()
    .isIn([
      "productions",
      "maintenance",
      "logistique",
      "qualité",
      "ip",
      "R&D",
      "autre",
    ])
    .withMessage("select a valid user service"),
  body("image").optional().isString().withMessage("image must be a string"),
  validatorMiddleware,
];
export const updateUserValidator = [
  paramsSanitizer("id"),
  bodySanitizer(
    "mat",
    "firstName",
    "lastName",
    "email",
    "phone",
    "role",
    "userCategory",
    "userService",
    "image"
  ),
  param("id").notEmpty().withMessage("id is required"),
  body("mat")
    .optional()
    .isLength({ min: 8, max: 8 })
    .withMessage("mat must be 8 characters long"),
  body("firstName")
    .isLength({ min: 3 })
    .withMessage("Too short firstName")
    .isLength({ max: 20 })
    .withMessage("too long firstName"),
  body("lastName")
    .isLength({ min: 3 })
    .withMessage("Too short lastName")
    .isLength({ max: 20 })
    .withMessage("too long lastName"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("phone")
    .isMobilePhone(["ar-TN"])
    .withMessage("Invalid phone number only accepted TN Phone numbers"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("role must be user or admin"),
  body("userCategory")
    .optional()
    .isIn(["corporaite", "top-management", "midel-management", "operational"])
    .withMessage("select a valid user category"),
  body("userService")
    .optional()
    .isIn([
      "productions",
      "maintenance",
      "logistique",
      "qualité",
      "ip",
      "R&D",
      "autre",
    ])
    .withMessage("select a valid user service"),
  body("image").optional().isString().withMessage("image must be a string"),

  validatorMiddleware,
];
export const updatePasswordValidator = [
  paramsSanitizer("id"),
  bodySanitizer("password", "passwordConfirm"),
  param("id").notEmpty().withMessage("id is required"),
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
  param("id").notEmpty().withMessage("id is required"),
  validatorMiddleware,
];
export const getUserValidator = [
  paramsSanitizer("id"),
  param("id").notEmpty().withMessage("id is required"),
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
