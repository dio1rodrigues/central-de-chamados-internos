const notFoundHandler = (req, res) => {
  return res.status(404).render("errors/404", {
    title: "Página não encontrada",
    heading: "Página não encontrada",
    message:
      "O endereço informado não existe ou não está mais disponível.",
    backUrl: "/dashboard",
    backText: "Voltar ao dashboard",
  });
};

const errorHandler = (
  error,
  req,
  res,
  next
) => {
  console.error("[ERRO NÃO TRATADO]", {
    message: error.message,
    stack: error.stack,
    method: req.method,
    path: req.originalUrl,
  });

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).render("errors/500", {
    title: "Erro interno",
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};