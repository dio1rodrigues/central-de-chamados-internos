const ticketService = require("../services/ticket.service");
const auditService = require("../services/audit.service");

const {
  AUDIT_ACTIONS,
} = require("../constants/audit.constants");

const {
  getRequestContext,
} = require("../utils/request-context.util");

const {
  validateCreateTicketInput,
  validateCommentInput,
} = require("../validators/ticket.validator");

const {
  buildAttachmentData,
  removeUploadedFile,
} = require("../utils/upload.util");

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
    fileError: "",

    ...getFormOptions(),
  });
};

const createTicket = async (req, res, next) => {
  let uploadedFile = req.file || null;

  try {
    const validation =
      validateCreateTicketInput(req.body);

    const fileError =
      req.fileUploadError || "";

    if (!validation.isValid || fileError) {
      await removeUploadedFile(uploadedFile);

      return res.status(400).render(
        "tickets/create",
        {
          title: "Novo chamado",
          values: validation.values,
          errors: validation.errors,
          fileError,
          ...getFormOptions(),
        }
      );
    }

    const attachment =
      buildAttachmentData(uploadedFile);

    const ticket =
      await ticketService.createTicket({
        requesterId: req.session.user.id,
        ...validation.values,
        attachment,
      });

    uploadedFile = null;

    await auditService.recordAudit({
      action: AUDIT_ACTIONS.TICKET_CREATED,
      actorId: req.session.user.id,
      ticketId: ticket._id,
      description:
        `Chamado ${ticket.protocol} criado.`,

      metadata: {
        protocol: ticket.protocol,
        type: ticket.type,
        priority: ticket.priority,
        hasAttachment: Boolean(attachment),

        attachmentName:
          attachment?.originalName || null,
      },

      ...getRequestContext(req),
    });

    return res.redirect(
      `/chamados/${ticket._id}`
    );
  } catch (error) {
    await removeUploadedFile(uploadedFile);

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
        heading: "Chamado não encontrado",
        message:
          "O chamado informado não existe ou você não possui acesso a ele.",
        backUrl: "/chamados",
        backText: "Voltar para chamados",
      });
    }

    return res.render(
    "tickets/show",
    getTicketDetailsViewData(ticket, {
      statusUpdated: req.query.statusUpdated === "1",
      commentAdded: req.query.commentAdded === "1",
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
    commentError = "",
    commentValue = "",
    commentAdded = false,
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
  commentError,
  commentValue,
  commentAdded,
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

    const latestHistory =
    ticket.statusHistory[
      ticket.statusHistory.length - 1
    ];

    await auditService.recordAudit({
      action: AUDIT_ACTIONS.TICKET_STATUS_CHANGED,
      actorId: req.session.user.id,
      ticketId: ticket._id,
      description:
        `Status do chamado ${ticket.protocol} alterado.`,
      metadata: {
        protocol: ticket.protocol,
        previousStatus: latestHistory.previousStatus,
        newStatus: latestHistory.newStatus,
      },
      ...getRequestContext(req),
    });

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

const addComment = async (req, res, next) => {
  try {
    const validation = validateCommentInput(req.body);

    if (!validation.isValid) {
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
          commentError: validation.errors.message,
          commentValue: validation.values.message,
        })
      );
    }

    const ticket = await ticketService.addTicketComment({
      ticketId: req.params.id,
      authorId: req.session.user.id,
      message: validation.values.message,
    });

    if (!ticket) {
      return res.status(404).render("errors/404", {
        title: "Chamado não encontrado",
      });
    }

    if (!ticket) {
  return res.status(404).render("errors/404", {
    title: "Chamado não encontrado",
  });
}

if (!ticket) {
  return res.status(404).render("errors/404", {
    title: "Chamado não encontrado",
  });
}

  await auditService.recordAudit({
    action: AUDIT_ACTIONS.TICKET_COMMENT_ADDED,
    actorId: req.session.user.id,
    ticketId: ticket._id,
    description:
      `Comentário registrado no chamado ${ticket.protocol}.`,
    metadata: {
      protocol: ticket.protocol,
    },
    ...getRequestContext(req),
  });

    return res.redirect(
      `/chamados/${ticket._id}?commentAdded=1`
    );

  } catch (error) {
    const expectedErrors = [
      "INVALID_INPUT",
      "INVALID_COMMENT",
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
          commentError: error.message,
          commentValue:
            typeof req.body.message === "string"
              ? req.body.message.trim()
              : "",
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
  addComment,
};