const express = require("express");

const adminController =
  require("../controllers/admin.controller");

const userController =
  require("../controllers/user.controller");

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

router.get(
  "/admin/auditoria",
  requireAuth,
  requireAdmin,
  adminController.showAuditLogs
);

router.get(
  "/admin/users",
  requireAuth,
  requireAdmin,
  userController.showUserList
);

router.get(
  "/admin/users/new",
  requireAuth,
  requireAdmin,
  userController.showUserCreateForm
);

router.post(
  "/admin/users",
  requireAuth,
  requireAdmin,
  userController.handleUserCreate
);

module.exports = router;