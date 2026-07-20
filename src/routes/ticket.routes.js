const express = require("express");

const ticketController = require("../controllers/ticket.controller");

const {
  requireAuth,
} = require("../middlewares/auth.middleware");

const {
  requireAdmin,
} = require("../middlewares/role.middleware");

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

router.post(
  "/chamados/:id/status",
  requireAuth,
  requireAdmin,
  ticketController.updateStatus
);

router.post(
  "/chamados/:id/comentarios",
  requireAuth,
  requireAdmin,
  ticketController.addComment
);

router.get(
  "/chamados/:id",
  requireAuth,
  ticketController.showTicket
);

module.exports = router;