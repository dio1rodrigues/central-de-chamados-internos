const mongoose = require("mongoose");

const connectDatabase = async () => {
  const databaseUri = process.env.MONGODB_URI;

  if (!databaseUri) {
    throw new Error("A variável MONGODB_URI não foi configurada.");
  }

  await mongoose.connect(databaseUri);

  console.log("MongoDB conectado com sucesso.");
};

module.exports = connectDatabase;