import express from "express";

import { protect, allowedTo } from "../services/authService";
import {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getUsers,
} from "../services/userService";
import {
  createUserValidator,
  updateUserValidator,
  updatePasswordValidator,
  getUserValidator,
  deleteUserValidator,
  updateLoggedUserValidator,
  getLoggedUserValidator,
} from "../utils/validators/userValidator";
import {
  uploadUserImage,
  resizeUserImage,
} from "../middlewares/uploadImage/uploadUserImage";
import extractUserId from "../middlewares/extractUserId";

const router = express.Router();

router.use(protect);

router
  .route("/me")
  .get(extractUserId, getLoggedUserValidator, getUser)
  .put(
    extractUserId,
    uploadUserImage,
    resizeUserImage,
    updateLoggedUserValidator,
    updateUser
  );

router.use(allowedTo("admin"));

router
  .route("/")
  .get(getUsers)
  .post(uploadUserImage, resizeUserImage, createUserValidator, createUser);

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeUserImage, updateUserValidator, updateUser)
  .delete(deleteUserValidator, deleteUser);

router.put("/change-password/:id", updatePasswordValidator, updateUser);

export default router;
