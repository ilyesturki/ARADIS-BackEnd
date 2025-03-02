import express from "express";
// import {
//   getFpsValidator,
//   createFpsValidator,
//   updateFpsValidator,
//   deleteFpsValidator,
// } from "../utils/validators/fpsValidator";

import {
  createOrUpdateFpsProblem,
  createOrUpdateFpsImmediateActions,
  createOrUpdateFpsCause,
  createOrUpdateFpsDefensiveActions,
  getFpsByFpsId,
  getAllFpsForUser,
} from "../services/fpsService";
import { protect, allowedTo } from "../services/authService";
import {
  resizeFpsImages,
  uploadFpsImages,
} from "../middlewares/uploadImage/uploadFpsImage";

const router = express.Router();

router.route("/problem/:id").post(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  createOrUpdateFpsProblem
);

router.route("/immediate-actions/:id").post(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  createOrUpdateFpsImmediateActions
);

router.route("/cause/:id").post(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  createOrUpdateFpsCause
);

router.route("/defensive-actions/:id").post(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  createOrUpdateFpsDefensiveActions
);

router.route("/:id").get(
  protect,
  (req, res, next) => {
    console.log(req.params);
    next();
  },
  getFpsByFpsId
);

router.route("/").get(
  protect,
  (req, res, next) => {
    console.log(req.params);
    next();
  },
  getAllFpsForUser
);

export default router;
