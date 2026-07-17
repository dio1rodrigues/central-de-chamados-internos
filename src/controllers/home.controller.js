const showHome = (req, res) => {
  res.render("home/index", {
    title: "Central de Chamados Internos",
    pageTitle: "Página inicial",
  });
};

module.exports = {
  showHome,
};