const ticketService = require("../services/ticket.service");

const {
  validateCreateTicketInput,
} = require("../validators/ticket.validator");

const {
  TICKET_TYPE_VALUES,
  TICKET_PRIORITY_VALUES,
  TICKET_STATUS_VALUES,
  TICKET_TYPE_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_TRANSITIONS,
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

  statusOptions: TICKET_STATUS_VALUES.map((value) => ({
    value,
    label: TICKET_STATUS_LABELS[value],
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
      status: "",
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
    const currentUser = req.session.user;
    const isAdmin = currentUser.role === "ADMIN";

    const {
      selectedFilters,
      databaseFilters,
    } = isAdmin
      ? getAdminFilters(req.query)
      : {
          selectedFilters: {
            type: "",
            priority: "",
            status: "",
          },
          databaseFilters: {},
        };

    const tickets = await ticketService.listTicketsForUser(
      currentUser,
      databaseFilters
    );

    return res.render("tickets/index", {
      title: "Chamados",
      tickets,
      selectedFilters,
      typeLabels: TICKET_TYPE_LABELS,
      priorityLabels: TICKET_PRIORITY_LABELS,
      statusLabels: TICKET_STATUS_LABELS,
      ...getFilterOptions(),
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

    return res.render(
      "tickets/show",
      getTicketDetailsViewData(ticket, {
        statusUpdated: req.query.statusUpdated === "1",
  })
);
  } catch (error) {
    return next(error);
  }
};

const getFilterOptions = () => ({
  typeOptions: TICKET_TYPE_VALUES.map((value) => ({
    value,
    label: TICKET_TYPE_LABELS[value],
  })),

  priorityOptions: TICKET_PRIORITY_VALUES.map((value) => ({
    value,
    label: TICKET_PRIORITY_LABELS[value],
  })),

  statusOptions: TICKET_STATUS_VALUES.map((value) => ({
    value,
    label: TICKET_STATUS_LABELS[value],
  })),
});

const getValidFilter = (value, allowedValues) => {
  return allowedValues.includes(value) ? value : "";
};

const getAdminFilters = (query = {}) => {
  const selectedFilters = {
    type: getValidFilter(query.type, TICKET_TYPE_VALUES),
    priority: getValidFilter(
      query.priority,
      TICKET_PRIORITY_VALUES
    ),
    status: getValidFilter(query.status, TICKET_STATUS_VALUES),
  };

  const databaseFilters = {};

  if (selectedFilters.type) {
    databaseFilters.type = selectedFilters.type;
  }

  if (selectedFilters.priority) {
    databaseFilters.priority = selectedFilters.priority;
  }

  if (selectedFilters.status) {
    databaseFilters.status = selectedFilters.status;
  }

  return {
    selectedFilters,
    databaseFilters,
  };
};

const getAvailableStatusOptions = (currentStatus) => {
  const allowedStatuses =
    TICKET_STATUS_TRANSITIONS[currentStatus] || [];

  return allowedStatuses.map((value) => ({
    value,
    label: TICKET_STATUS_LABELS[value],
  }));
};

const getTicketDetailsViewData = (
  ticket,
  {
    statusError = "",
    statusUpdated = false,
  } = {}
) => ({
  title: `Detalhes — ${ticket.protocol}`,
  ticket,
  typeLabels: TICKET_TYPE_LABELS,
  priorityLabels: TICKET_PRIORITY_LABELS,
  statusLabels: TICKET_STATUS_LABELS,
  statusOptions: getAvailableStatusOptions(ticket.status),
  statusError,
  statusUpdated,
});

const updateStatus = async (req, res, next) => {
  try {
    const newStatus =
      typeof req.body.status === "string"
        ? req.body.status.trim()
        : "";

    const ticket = await ticketService.updateTicketStatus({
      ticketId: req.params.id,
      newStatus,
      changedBy: req.session.user.id,
    });

    if (!ticket) {
      return res.status(404).render("errors/404", {
        title: "Chamado não encontrado",
      });
    }

    return res.redirect(
      `/chamados/${ticket._id}?statusUpdated=1`
    );
  } catch (error) {
    const expectedErrors = [
      "INVALID_INPUT",
      "INVALID_STATUS",
      "SAME_STATUS",
      "INVALID_TRANSITION",
    ];

    if (!expectedErrors.includes(error.code)) {
      return next(error);
    }

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

      return res.status(400).render(
        "tickets/show",
        getTicketDetailsViewData(ticket, {
          statusError: error.message,
        })
      );
    } catch (readError) {
      return next(readError);
    }
  }
};

module.exports = {
  showCreateForm,
  createTicket,
  listTickets,
  showTicket,
  updateStatus,
};