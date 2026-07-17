const express = require("express");

const {
  requireAuth,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/dashboard", requireAuth, (req, res) => {
  return res.render("dashboard/index", {
    title: "Dashboard",
  });
});

module.exports = router;