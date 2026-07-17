const express = require("express");

const authController = require("../controllers/auth.controller");
const {
  requireAuth,
  requireGuest,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/login", requireGuest, authController.showLogin);
router.post("/login", requireGuest, authController.login);
router.post("/logout", requireAuth, authController.logout);

module.exports = router;