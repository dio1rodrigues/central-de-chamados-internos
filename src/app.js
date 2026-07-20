const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const createSessionMiddleware = require("./config/session");

const homeRoutes = require("./routes/home.routes");
const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const adminRoutes = require("./routes/admin.routes");
const ticketRoutes = require("./routes/ticket.routes");

const app = express();

// Configuração do EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/main");

// Middlewares
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(createSessionMiddleware());
app.use(
  "/vendor/chart.js",
  express.static(
    path.join(
      __dirname,
      "..",
      "node_modules",
      "chart.js",
      "dist"
    )
  )
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Rotas
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(adminRoutes);
app.use(ticketRoutes);
app.use("/", homeRoutes);


module.exports = app;