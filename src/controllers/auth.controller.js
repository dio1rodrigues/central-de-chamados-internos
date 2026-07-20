const authService = require("../services/auth.service");
const auditService = require("../services/audit.service");

const {
  AUDIT_ACTIONS,
} = require("../constants/audit.constants");

const {
  getRequestContext,
} = require("../utils/request-context.util");

const regenerateSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const saveSession = (req) =>
  new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const destroySession = (req) =>
  new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

const showLogin = (req, res) => {
  return res.render("auth/login", {
    title: "Entrar",
    error: null,
    email: "",
  });
};

const login = async (req, res, next) => {
  try {
    const email =
      req.body.email?.trim().toLowerCase() || "";

    const password = req.body.password || "";

    if (!email || !password) {
      await auditService.recordAudit({
        action: AUDIT_ACTIONS.LOGIN_FAILURE,
        description:
          "Tentativa de login sem credenciais completas.",
        metadata: {
          email,
          reason: "MISSING_CREDENTIALS",
        },
        ...getRequestContext(req),
      });

      return res.status(400).render("auth/login", {
        title: "Entrar",
        error: "Informe o e-mail e a senha.",
        email,
      });
    }

    const user = await authService.authenticateUser(
      email,
      password
    );

    if (!user) {
      await auditService.recordAudit({
        action: AUDIT_ACTIONS.LOGIN_FAILURE,
        description:
          "Tentativa de login sem sucesso.",
        metadata: {
          email,
          reason: "INVALID_CREDENTIALS",
        },
        ...getRequestContext(req),
      });

      return res.status(401).render("auth/login", {
        title: "Entrar",
        error: "E-mail ou senha inválidos.",
        email,
      });
    }

    await regenerateSession(req);

    req.session.user = user;

    await saveSession(req);

    await auditService.recordAudit({
      action: AUDIT_ACTIONS.LOGIN_SUCCESS,
      actorId: user.id,
      description: "Login realizado com sucesso.",
      ...getRequestContext(req),
    });

    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const currentUser = req.session.user;
    const requestContext = getRequestContext(req);

    await destroySession(req);

    res.clearCookie("central_chamados.sid");

    await auditService.recordAudit({
      action: AUDIT_ACTIONS.LOGOUT,
      actorId: currentUser.id,
      description: "Logout realizado pelo usuário.",
      ...requestContext,
    });

    return res.redirect("/login");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  showLogin,
  login,
  logout,
};