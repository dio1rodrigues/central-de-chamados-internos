const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");

const homeRoutes = require("./routes/home.routes");

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

// Rotas
app.use("/", homeRoutes);

module.exports = app;