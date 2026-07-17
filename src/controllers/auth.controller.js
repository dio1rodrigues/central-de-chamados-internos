const authService = require("../services/auth.service");

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

const showLogin = (req, res) => {
  res.render("auth/login", {
    title: "Entrar",
    error: null,
    email: "",
  });
};

const login = async (req, res, next) => {
  try {
    const email = req.body.email?.trim() || "";
    const password = req.body.password || "";

    if (!email || !password) {
      return res.status(400).render("auth/login", {
        title: "Entrar",
        error: "Informe o e-mail e a senha.",
        email,
      });
    }

    const user = await authService.authenticateUser(email, password);

    if (!user) {
      return res.status(401).render("auth/login", {
        title: "Entrar",
        error: "E-mail ou senha inválidos.",
        email,
      });
    }

    await regenerateSession(req);

    req.session.user = user;

    await saveSession(req);

    return res.redirect("/dashboard");
  } catch (error) {
    return next(error);
  }
};

const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    res.clearCookie("central_chamados.sid");
    res.redirect("/login");
  });
};

module.exports = {
  showLogin,
  login,
  logout,
};