const app = require("../src/app");
const connectDatabase = require(
  "../src/config/database"
);

let databaseConnection;

const handler = async (req, res) => {
  try {
    if (!databaseConnection) {
      databaseConnection = connectDatabase();
    }

    await databaseConnection;

    return app(req, res);
  } catch (error) {
    console.error("Erro na função da Vercel:", error);

    return res.status(500).send(
      "Erro interno do servidor."
    );
  }
};

module.exports = handler;