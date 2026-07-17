const session = require("express-session");
const { MongoStore } = require("connect-mongo");

const createSessionMiddleware = () => {
  const { MONGODB_URI, SESSION_SECRET, NODE_ENV } = process.env;

  if (!MONGODB_URI) {
    throw new Error("A variável MONGODB_URI não foi configurada.");
  }

  if (!SESSION_SECRET) {
    throw new Error("A variável SESSION_SECRET não foi configurada.");
  }

  return session({
    name: "central_chamados.sid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
      collectionName: "sessions",
      ttl: 4 * 60 * 60,
    }),

    cookie: {
      httpOnly: true,
      secure: NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 4 * 60 * 60 * 1000,
    },
  });
};

module.exports = createSessionMiddleware;