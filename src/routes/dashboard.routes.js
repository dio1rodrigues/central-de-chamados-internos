const express = require("express");

const router = express.Router();

router.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  return res.render("dashboard/index", {
    title: "Dashboard",
  });
});

module.exports = router;