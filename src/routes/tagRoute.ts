import express from "express";
// import {
//   getTagValidator,
//   createTagValidator,
//   updateTagValidator,
//   deleteTagValidator,
// } from "../utils/validators/tagValidator";

import {
  createTag,
  createOrUpdateTagActions,
  createTagValidation,
  getTagByTagId,
  getAllTag,
  scanTagQRCode,
  // getAllTagHelperForUser,
} from "../services/tagService";
import {
  getSelectedUsersForTag,
  getTagQrCode,
  getTagQrCodeScanStatistics,
  getTagStatusOverviewChartData,
  getAllTagQrCodeScanStatistics,
  getCompletedTagStats,
} from "../services/tagPanelService";
import { protect, allowedTo } from "../services/authService";
import {
  resizeTagImages,
  uploadTagImages,
} from "../middlewares/uploadImage/uploadTagImage";

const router = express.Router();

router.route("/:id").post(
  protect,
  uploadTagImages,
  resizeTagImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  createTag
);

router.route("/actions/:id").post(
  protect,
  uploadTagImages,
  resizeTagImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  createOrUpdateTagActions
);

router.route("/:id/scan").post(
  protect,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  scanTagQRCode
);

router.route("/all-qr-codes-scan-statistics").get(
  protect,
  uploadTagImages,
  resizeTagImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getAllTagQrCodeScanStatistics
);

router.route("/status-overview-chart").get(
  protect,
  uploadTagImages,
  resizeTagImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getTagStatusOverviewChartData
);

router.route("/completed-tag-chart").get(
  protect,
  uploadTagImages,
  resizeTagImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getCompletedTagStats
);


router.route("/selected-users/:id").get(
  protect,
  uploadTagImages,
  resizeTagImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getSelectedUsersForTag
);

router.route("/qr-code/:id").get(
  protect,
  uploadTagImages,
  resizeTagImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getTagQrCode
);

router.route("/qr-code-scan-statistics/:id").get(
  protect,
  uploadTagImages,
  resizeTagImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  getTagQrCodeScanStatistics
);

router.route("/validation/:id").post(
  protect,
  uploadTagImages,
  resizeTagImages,
  (req, res, next) => {
    console.log(req.body);
    console.log(req.params);
    next();
  },
  createTagValidation
);

router.route("/").get(
  protect,
  (req, res, next) => {
    console.log(req.params);
    next();
  },
  getAllTag
);

router.route("/:id").get(
  protect,
  (req, res, next) => {
    console.log(req.params);
    next();
  },
  getTagByTagId
);

export default router;
