require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const connectDatabase = require("../src/config/database");
const User = require("../src/models/User");

const createUserIfNotExists = async ({
  name,
  email,
  password,
  role,
}) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    console.log(`Usuário já existe: ${normalizedEmail}`);
    return existingUser;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role,
    active: true,
  });

  console.log(`Usuário criado: ${user.email}`);

  return user;
};

const runSeed = async () => {
  try {
    validateEnvironmentVariables();
    await connectDatabase();

    await createUserIfNotExists({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "ADMIN",
    });

    await createUserIfNotExists({
      name: process.env.USER_NAME,
      email: process.env.USER_EMAIL,
      password: process.env.USER_PASSWORD,
      role: "USER",
    });

    console.log("Seed concluído com sucesso.");
  } catch (error) {
    console.error("Erro ao executar o seed.");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

const requiredEnvironmentVariables = [
  "ADMIN_NAME",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "USER_NAME",
  "USER_EMAIL",
  "USER_PASSWORD",
];

const validateEnvironmentVariables = () => {
  const missingVariables = requiredEnvironmentVariables.filter(
    (variable) => !process.env[variable]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Variáveis não configuradas: ${missingVariables.join(", ")}`
    );
  }
};

runSeed();