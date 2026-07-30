const User = require("../models/User");

const refreshSessionUser = async (
  req,
  res,
  next
) => {
  try {
    if (!req.session?.user?.id) {
      res.locals.currentUser = null;

      return next();
    }

    const user = await User.findById(
      req.session.user.id
    )
      .select("name email role active")
      .lean();

    if (!user || !user.active) {
      return req.session.destroy((error) => {
        if (error) {
          return next(error);
        }

        res.clearCookie("central_chamados.sid");

        return res.redirect("/login");
      });
    }

    req.session.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.locals.currentUser =
      req.session.user;

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  refreshSessionUser,
};