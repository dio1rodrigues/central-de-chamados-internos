const express = require("express");

const adminController = require("../controllers/admin.controller");
const {
  requireAuth,
} = require("../middlewares/auth.middleware");
const {
  requireAdmin,
} = require("../middlewares/role.middleware");

const router = express.Router();

router.get(
  "/admin",
  requireAuth,
  requireAdmin,
  adminController.showAdminPanel
);

module.exports = router;