const express = require("express");

const ticketController = require("../controllers/ticket.controller");

const {
  requireAuth,
} = require("../middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/chamados/novo",
  requireAuth,
  ticketController.showCreateForm
);

router.post(
  "/chamados",
  requireAuth,
  ticketController.createTicket
);

router.get(
  "/chamados",
  requireAuth,
  ticketController.listTickets
);

router.get(
  "/chamados/:id",
  requireAuth,
  ticketController.showTicket
);

module.exports = router;