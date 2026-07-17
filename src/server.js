require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Servidor executando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Não foi possível iniciar a aplicação.");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();