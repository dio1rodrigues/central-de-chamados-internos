const mongoose = require("mongoose");

const Ticket = require("../models/Ticket");

const {
  TICKET_STATUSES,
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

    statusHistory: [
      {
        previousStatus: undefined,
        newStatus: TICKET_STATUSES.OPEN,
        changedBy: requesterId,
      },
    ],
  });
};

const listTicketsForUser = async (currentUser) => {
  const filter =
    currentUser.role === "ADMIN"
      ? {}
      : {
          requester: currentUser.id,
        };

  return Ticket.find(filter)
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

module.exports = {
  createTicket,
  listTicketsForUser,
  findTicketForUser,
};