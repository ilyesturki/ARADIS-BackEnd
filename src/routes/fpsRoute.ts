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
  createFpsValidation,
  getAllFps,
} from "../services/fpsService";
import {
  createComment,
  updateComment,
  deleteComment,
  getAllCommentByFps,
} from "../services/fpsCommentService";
import {
  getSelectedUsersForFps,
  getFpsQrCode,
  getFpsQrCodeScanStatistics,
  getFpsStatusOverviewChartData,
  getAllFpsQrCodeScanStatistics,
  getCompletedFpsStats,
  getFailedFpsStats,
} from "../services/fpsPanelService";
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

router.route("/all-qr-codes-scan-statistics").get(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getAllFpsQrCodeScanStatistics
);

router.route("/status-overview-chart").get(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getFpsStatusOverviewChartData
);

router.route("/completed-fps-chart").get(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getCompletedFpsStats
);

router.route("/failed-fps-chart").get(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getFailedFpsStats
);

router.route("/selected-users/:id").get(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getSelectedUsersForFps
);

router.route("/qr-code/:id").get(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getFpsQrCode
);

router.route("/qr-code-scan-statistics/:id").get(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getFpsQrCodeScanStatistics
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

router.route("/validation/:id").post(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  createFpsValidation
);

router.route("/comments/:id").post(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  createComment
);
// test
router.route("/comments/:id").put(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  updateComment
);

router.route("/comments/:id").delete(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  deleteComment
);

router.route("/comments/:id").get(
  protect,
  uploadFpsImages,
  resizeFpsImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getAllCommentByFps
);

router.route("/me").get(
  protect,
  (req, res, next) => {
    console.log(req.params);
    next();
  },
  getAllFpsForUser
);

router.route("/").get(
  protect,
  (req, res, next) => {
    console.log(req.params);
    next();
  },
  getAllFps
);

router.route("/:id").get(
  protect,
  (req, res, next) => {
    console.log(req.params);
    next();
  },
  getFpsByFpsId
);

export default router;
