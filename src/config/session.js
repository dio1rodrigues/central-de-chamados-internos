const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const createSessionMiddleware = () => {
  const isProduction =
    process.env.NODE_ENV === "production";

  return session({
    name: "central_chamados.sid",

    secret: process.env.SESSION_SECRET,

    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),

    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    },
  });
};

module.exports = {
  createSessionMiddleware,
};