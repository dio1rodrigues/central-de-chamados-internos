const showAdminPanel = (req, res) => {
  return res.render("admin/index", {
    title: "Área administrativa",
  });
};

module.exports = {
  showAdminPanel,
};