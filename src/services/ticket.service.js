const mongoose = require("mongoose");

const Ticket = require("../models/Ticket");

const {
  TICKET_STATUSES,
  TICKET_STATUS_VALUES,
  TICKET_STATUS_TRANSITIONS,
} = require("../constants/ticket.constants");

const {
  generateTicketProtocol,
} = require("./protocol.service");

const createTicket = async ({
  requesterId,
  title,
  description,
  type,
  priority,
  attachment = null,
}) => {
  if (!mongoose.isValidObjectId(requesterId)) {
    throw new Error("Solicitante inválido.");
  }

  const protocol = await generateTicketProtocol();

  return Ticket.create({
    protocol,
    title,
    description,
    type,
    priority,
    requester: requesterId,

    attachments: attachment
      ? [attachment]
      : [],

    statusHistory: [
      {
        previousStatus: undefined,
        newStatus: TICKET_STATUSES.OPEN,
        changedBy: requesterId,
      },
    ],
  });
};

const listTicketsForUser = async (currentUser, filters = {}) => {
  const query =
    currentUser.role === "ADMIN"
      ? { ...filters }
      : {
          requester: currentUser.id,
        };

  return Ticket.find(query)
    .populate("requester", "name email")
    .sort({
      createdAt: -1,
    })
    .lean();
};

const findTicketForUser = async (ticketId, currentUser) => {
  if (!mongoose.isValidObjectId(ticketId)) {
    return null;
  }

  const filter = {
    _id: ticketId,
  };

  if (currentUser.role !== "ADMIN") {
    filter.requester = currentUser.id;
  }

  return Ticket.findOne(filter)
    .populate("requester", "name email")
    .populate("comments.author", "name")
    .populate("statusHistory.changedBy", "name")
    .lean();
};

const createTicketServiceError = (code, message) => {
  const error = new Error(message);
  error.code = code;

  return error;
};

const updateTicketStatus = async ({
  ticketId,
  newStatus,
  changedBy,
}) => {
  if (
    !mongoose.isValidObjectId(ticketId) ||
    !mongoose.isValidObjectId(changedBy)
  ) {
    throw createTicketServiceError(
      "INVALID_INPUT",
      "Dados inválidos para atualização do chamado."
    );
  }

  if (!TICKET_STATUS_VALUES.includes(newStatus)) {
    throw createTicketServiceError(
      "INVALID_STATUS",
      "O status informado é inválido."
    );
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    return null;
  }

  const previousStatus = ticket.status;

  if (previousStatus === newStatus) {
    throw createTicketServiceError(
      "SAME_STATUS",
      "O chamado já possui o status selecionado."
    );
  }

  const allowedTransitions =
    TICKET_STATUS_TRANSITIONS[previousStatus] || [];

  if (!allowedTransitions.includes(newStatus)) {
    throw createTicketServiceError(
      "INVALID_TRANSITION",
      "Essa mudança de status não é permitida."
    );
  }

  ticket.status = newStatus;

  ticket.statusHistory.push({
    previousStatus,
    newStatus,
    changedBy,
  });

  await ticket.save();

  return ticket;
};

const addTicketComment = async ({
  ticketId,
  authorId,
  message,
}) => {
  if (
    !mongoose.isValidObjectId(ticketId) ||
    !mongoose.isValidObjectId(authorId)
  ) {
    throw createTicketServiceError(
      "INVALID_INPUT",
      "Dados inválidos para registrar o comentário."
    );
  }

  const normalizedMessage =
    typeof message === "string"
      ? message.trim()
      : "";

  if (
    normalizedMessage.length === 0 ||
    normalizedMessage.length > 2000
  ) {
    throw createTicketServiceError(
      "INVALID_COMMENT",
      "O comentário informado é inválido."
    );
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    return null;
  }

  ticket.comments.push({
    author: authorId,
    message: normalizedMessage,
  });

  await ticket.save();

  return ticket;
};

module.exports = {
  createTicket,
  listTicketsForUser,
  findTicketForUser,
  updateTicketStatus,
  addTicketComment,
};