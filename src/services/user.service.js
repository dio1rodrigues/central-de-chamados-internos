const bcrypt = require("bcrypt");

const User = require("../models/User");

const {
  USER_ROLE_VALUES,
} = require("../constants/user.constants");

const createUserServiceError = (code, message) => {
  const error = new Error(message);
  error.code = code;

  return error;
};

const createUser = async ({
  name,
  email,
  password,
  role,
}) => {
  const normalizedName =
    typeof name === "string"
      ? name.trim()
      : "";

  const normalizedEmail =
    typeof email === "string"
      ? email.trim().toLowerCase()
      : "";

  const normalizedRole =
    typeof role === "string"
      ? role.trim()
      : "";

  if (!USER_ROLE_VALUES.includes(normalizedRole)) {
    throw createUserServiceError(
      "INVALID_ROLE",
      "Selecione um papel de usuário válido."
    );
  }

  const existingUser = await User.exists({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw createUserServiceError(
      "DUPLICATE_EMAIL",
      "Já existe um usuário cadastrado com este e-mail."
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      role: normalizedRole,
    });

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  } catch (error) {
    if (error?.code === 11000) {
      throw createUserServiceError(
        "DUPLICATE_EMAIL",
        "Já existe um usuário cadastrado com este e-mail."
      );
    }

    throw error;
  }
};

const listUsers = async () => {
  return User.find()
    .select("-passwordHash")
    .sort({ name: 1 })
    .lean();
};

module.exports = {
  createUser,
  listUsers,
};