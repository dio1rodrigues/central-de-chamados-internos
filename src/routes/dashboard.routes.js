const express = require("express");

const dashboardController =
  require("../controllers/dashboard.controller");

const {
  requireAuth,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/dashboard",
  requireAuth,
  dashboardController.showDashboard
);

module.exports = router;