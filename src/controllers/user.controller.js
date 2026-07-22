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

const handleUserCreate = async (req, res, next) => {
  const validation = validateCreateUserInput(req.body);

  if (!validation.isValid) {
    return res.status(400).render("admin/user/create", {
      title: "Criar Novo Usuário",
      errors: validation.errors,
      values: getSafeFormValues(validation.values),
      roleOptions: getRoleOptions(),
    });
  }

  try {
    const createdUser = await userService.createUser(
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

    return res.redirect("/admin/users?created=1");
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

module.exports = {
  showUserList,
  showUserCreateForm,
  handleUserCreate,
};