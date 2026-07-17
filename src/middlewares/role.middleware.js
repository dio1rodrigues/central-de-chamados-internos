const requireAdmin = (req, res, next) => {
  if (req.session.user?.role !== "ADMIN") {
    return res.status(403).render("errors/403", {
      title: "Acesso negado",
    });
  }

  return next();
};

module.exports = {
  requireAdmin,
};