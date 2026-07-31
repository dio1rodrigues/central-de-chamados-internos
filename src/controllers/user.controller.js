const userService = require("../services/user.service");
const auditService = require("../services/audit.service");

const {
  validateCreateUserInput,
} = require("../validators/user.validator");

const {
  USER_ROLES,
  USER_ROLE_VALUES,
  USER_ROLE_LABELS,
} = require("../constants/user.constants");

const {
  AUDIT_ACTIONS,
} = require("../constants/audit.constants");

const {
  getRequestContext,
} = require("../utils/request-context.util");

const getRoleOptions = () => {
  return USER_ROLE_VALUES.map((value) => ({
    value,
    label: USER_ROLE_LABELS[value],
  }));
};

const getSafeFormValues = (values) => ({
  ...values,
  password: "",
});

const showUserList = async (req, res, next) => {
  try {
    const users = await userService.listUsers();

    return res.render("admin/user/list", {
      title: "Lista de Usuários",
      users,
      roleLabels: USER_ROLE_LABELS,
      userCreated: req.query.created === "1",
      userUpdated: req.query.updated === "1",
    });
  } catch (error) {
    return next(error);
  }
};

const showUserCreateForm = (req, res) => {
  return res.render("admin/user/create", {
    title: "Criar Novo Usuário",

    errors: {},

    values: {
      name: "",
      email: "",
      password: "",
      role: USER_ROLES.USER,
    },

    roleOptions: getRoleOptions(),
  });
};

const handleUserCreate = async (
  req,
  res,
  next
) => {
  const validation =
    validateCreateUserInput(req.body);

  if (!validation.isValid) {
    return res.status(400).render(
      "admin/user/create",
      {
        title: "Criar Novo Usuário",
        errors: validation.errors,
        values: getSafeFormValues(
          validation.values
        ),
        roleOptions: getRoleOptions(),
      }
    );
  }

  try {
    const createdUser =
      await userService.createUser(
        validation.values
      );

    await auditService.recordAudit({
      action: AUDIT_ACTIONS.USER_CREATED,
      actorId: req.session.user.id,

      description:
        `Usuário ${createdUser.email} criado pelo administrador.`,

      metadata: {
        createdUserId: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },

      ...getRequestContext(req),
    });

    return res.redirect(
      303,
      "/admin/users?created=1"
    );
  } catch (error) {
    if (error.code === "DUPLICATE_EMAIL") {
      return res.status(400).render(
        "admin/user/create",
        {
          title: "Criar Novo Usuário",

          errors: {
            email: error.message,
          },

          values: getSafeFormValues(
            validation.values
          ),

          roleOptions: getRoleOptions(),
        }
      );
    }

    return next(error);
  }
};

const showUserEditForm = async (
  req,
  res,
  next
) => {
  try {
    const user = await userService.getUserById(
      req.params.id
    );

    if (!user) {
      return res.status(404).render(
        "errors/404",
        {
          title: "Usuário não encontrado",
        }
      );
    }

    return res.render("admin/user/edit", {
      title: "Editar Usuário",
      user,
      errors: {},
      roleOptions: getRoleOptions(),

      profileUpdated:
        req.query.updated === "1",

      roleChanged:
        req.query.roleChanged === "1",

      statusChanged:
        req.query.statusChanged === "1",
    });
  } catch (error) {
    return next(error);
  }
};

const handleUserProfileUpdate = async (
  req,
  res,
  next
) => {
  try {
    await userService.updateUserProfile(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
      }
    );

    return res.redirect(
      303,
      `/admin/users/${req.params.id}/edit?updated=1`
    );
  } catch (error) {
    if (error.code === "DUPLICATE_EMAIL") {
      try {
        const currentUser =
          await userService.getUserById(
            req.params.id
          );

        if (!currentUser) {
          return res.status(404).render(
            "errors/404",
            {
              title: "Usuário não encontrado",
            }
          );
        }

        return res.status(400).render(
          "admin/user/edit",
          {
            title: "Editar usuário",

            user: {
              ...currentUser,
              name: req.body.name,
              email: req.body.email,
            },

            errors: {
              email: error.message,
            },

            roleOptions: getRoleOptions(),
          }
        );
      } catch (findUserError) {
        return next(findUserError);
      }
    }

    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).render(
        "errors/404",
        {
          title: "Usuário não encontrado",
        }
      );
    }

    return next(error);
  }
};

const handleUserRoleChange = async (
  req,
  res,
  next
) => {
  try {
    await userService.changeUserRole(
      req.params.id,
      req.body.role
    );

    return res.redirect(
      303,
      `/admin/users/${req.params.id}/edit?roleChanged=1`
    );
  } catch (error) {
    if (
      error.code === "INVALID_ROLE" ||
      error.code === "ROLE_ALREADY_SET" ||
      error.code === "LAST_ADMIN_PROTECTED"
    ) {
      try {
        const user =
          await userService.getUserById(
            req.params.id
          );

        if (!user) {
          return res.status(404).render(
            "errors/404",
            {
              title: "Usuário não encontrado",
            }
          );
        }

        return res.status(400).render(
          "admin/user/edit",
          {
            title: "Editar usuário",
            user,

            errors: {
              role: error.message,
            },

            roleOptions: getRoleOptions(),
          }
        );
      } catch (findUserError) {
        return next(findUserError);
      }
    }

    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).render(
        "errors/404",
        {
          title: "Usuário não encontrado",
        }
      );
    }

    return next(error);
  }
};

const handleUserStatusChange = async (
  req,
  res,
  next
) => {
  try {
    const isActive =
      req.body.active === "true";

    await userService.changeUserStatus(
      req.params.id,
      isActive,
      req.session.user.id
    );

    return res.redirect(
      303,
      `/admin/users/${req.params.id}/edit?statusChanged=1`
    );
  } catch (error) {
    if (
      error.code === "INVALID_STATUS" ||
      error.code === "STATUS_ALREADY_SET" ||
      error.code === "SELF_DEACTIVATION_NOT_ALLOWED" ||
      error.code === "LAST_ADMIN_PROTECTED"
    ) {
      try {
        const user =
          await userService.getUserById(
            req.params.id
          );

        if (!user) {
          return res.status(404).render(
            "errors/404",
            {
              title: "Usuário não encontrado",
            }
          );
        }

        return res.status(400).render(
          "admin/user/edit",
          {
            title: "Editar usuário",
            user,

            errors: {
              active: error.message,
            },

            roleOptions: getRoleOptions(),
          }
        );
      } catch (findUserError) {
        return next(findUserError);
      }
    }

    if (error.code === "USER_NOT_FOUND") {
      return res.status(404).render(
        "errors/404",
        {
          title: "Usuário não encontrado",
        }
      );
    }

    return next(error);
  }
};

module.exports = {
  showUserList,
  showUserCreateForm,
  handleUserCreate,
  showUserEditForm,
  handleUserProfileUpdate,
  handleUserRoleChange,
  handleUserStatusChange,
};