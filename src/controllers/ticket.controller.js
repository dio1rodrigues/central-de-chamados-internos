const ticketService = require("../services/ticket.service");

const {
  validateCreateTicketInput,
} = require("../validators/ticket.validator");

const {
  TICKET_TYPE_VALUES,
  TICKET_PRIORITY_VALUES,
  TICKET_TYPE_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
} = require("../constants/ticket.constants");

const getFormOptions = () => ({
  typeOptions: TICKET_TYPE_VALUES.map((value) => ({
    value,
    label: TICKET_TYPE_LABELS[value],
  })),

  priorityOptions: TICKET_PRIORITY_VALUES.map((value) => ({
    value,
    label: TICKET_PRIORITY_LABELS[value],
  })),
});

const showCreateForm = (req, res) => {
  return res.render("tickets/create", {
    title: "Novo chamado",
    values: {
      title: "",
      description: "",
      type: "",
      priority: "",
    },
    errors: {},
    ...getFormOptions(),
  });
};

const createTicket = async (req, res, next) => {
  try {
    const validation = validateCreateTicketInput(req.body);

    if (!validation.isValid) {
      return res.status(400).render("tickets/create", {
        title: "Novo chamado",
        values: validation.values,
        errors: validation.errors,
        ...getFormOptions(),
      });
    }

    const ticket = await ticketService.createTicket({
      requesterId: req.session.user.id,
      ...validation.values,
    });

    return res.redirect(`/chamados/${ticket._id}`);
  } catch (error) {
    return next(error);
  }
};

const listTickets = async (req, res, next) => {
  try {
    const tickets = await ticketService.listTicketsForUser(
      req.session.user
    );

    return res.render("tickets/index", {
      title: "Chamados",
      tickets,
      typeLabels: TICKET_TYPE_LABELS,
      priorityLabels: TICKET_PRIORITY_LABELS,
      statusLabels: TICKET_STATUS_LABELS,
    });
  } catch (error) {
    return next(error);
  }
};

const showTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.findTicketForUser(
      req.params.id,
      req.session.user
    );

    if (!ticket) {
      return res.status(404).render("errors/404", {
        title: "Chamado não encontrado",
      });
    }

    return res.render("tickets/show", {
      title: `Detalhes — ${ticket.protocol}`,
      ticket,
      typeLabels: TICKET_TYPE_LABELS,
      priorityLabels: TICKET_PRIORITY_LABELS,
      statusLabels: TICKET_STATUS_LABELS,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  showCreateForm,
  createTicket,
  listTickets,
  showTicket,
};