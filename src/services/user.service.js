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

const formatUserResponse = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
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

    return formatUserResponse(user);
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

const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash").lean();

  if (!user) {
    return null;
  }
  return formatUserResponse(user);
};

const updateUserProfile = async (userId, profileData) => {
  const { name, email } = profileData;

  const normalizedName =
    typeof name === "string"
      ? name.trim()
      : "";
  const normalizedEmail =
    typeof email === "string"
      ? email.trim().toLowerCase()
      : "";

  const user = await User.findById(userId);
  
    if (!user) {
    throw createUserServiceError(
      "USER_NOT_FOUND",
      "Usuário não encontrado."
    );
  }

  const existingUser = await User.exists({
    email: normalizedEmail,
    _id: {
      $ne: userId
    },
  });

  if (existingUser) {
    throw createUserServiceError(
      "DUPLICATE_EMAIL",
      "Já existe um usuário cadastrado com este e-mail."
    );
  }
  
  user.name = normalizedName;
  user.email = normalizedEmail;

  await user.save();

  return formatUserResponse(user);
};

const changeUserRole = async (userId, newRole) => {
  const normalizedRole =
    typeof newRole === "string"
      ? newRole.trim()
      : "";
      
  if (!USER_ROLE_VALUES.includes(normalizedRole)) {
    throw createUserServiceError(
      "INVALID_ROLE",
      "Selecione um perfil válido."
    );
  }

const user = await User.findById(userId);

if (!user) {
  throw createUserServiceError(
  "USER_NOT_FOUND",
  "Usuário não encontrado.");
}

if (user.role === normalizedRole) {
  throw createUserServiceError(
  "ROLE_ALREADY_SET",
  "O usuário já possui esse perfil."
  );
}

  user.role = normalizedRole;

  await user.save();

  return formatUserResponse(user);
};

const changeUserStatus = async (
  userId,
  isActive
) => {
  if (typeof isActive !== "boolean") {
    throw createUserServiceError(
    "INVALID_STATUS",
    "Status inválido."
    );
  }

  const user = await User.findById(userId);

  if(!user) {
    throw createUserServiceError(
      "USER_NOT_FOUND",
      "Usuário não encontrado."
    );
  }

  if (user.active === isActive) {
    throw createUserServiceError(
    "STATUS_ALREADY_SET",
    "O usuário já possui esse status."
    );
  }
  
  user.active = isActive;

  await user.save();

  return formatUserResponse(user);
}


module.exports = {
  createUser,
  listUsers,
  getUserById,
  changeUserRole,
  updateUserProfile,
  changeUserStatus,
};