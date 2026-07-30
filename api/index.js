const app = require("../src/app");

const connectDatabase = require(
  "../src/config/database"
);

const handler = async (req, res) => {
  try {
    await connectDatabase();

    return app(req, res);
  } catch (error) {
    console.error(
      "[ERRO DE INICIALIZAÇÃO DA VERCEL]",
      {
        message: error.message,
        stack: error.stack,
      }
    );

    return res
      .status(500)
      .send("Erro ao conectar com o banco de dados.");
  }
};

module.exports = handler;