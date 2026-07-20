const mongoose = require("mongoose");

const Ticket = require("../models/Ticket");

const {
  TICKET_STATUS_VALUES,
  TICKET_TYPE_VALUES,
  TICKET_PRIORITY_VALUES,
} = require("../constants/ticket.constants");

const buildTicketFilter = (currentUser) => {
  if (!currentUser) {
    throw new Error(
      "Usuário não informado para o dashboard."
    );
  }

  if (currentUser.role === "ADMIN") {
    return {};
  }

  if (!mongoose.isValidObjectId(currentUser.id)) {
    throw new Error(
      "Usuário inválido para o dashboard."
    );
  }

  return {
    requester: new mongoose.Types.ObjectId(
      currentUser.id
    ),
  };
};

const countByField = async (
  filter,
  field
) => {
  return Ticket.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: `$${field}`,
        total: {
          $sum: 1,
        },
      },
    },
  ]);
};

const mapCountResults = (
  results,
  allowedValues
) => {
  const counts = Object.fromEntries(
    allowedValues.map((value) => [
      value,
      0,
    ])
  );

  results.forEach((result) => {
    if (
      Object.prototype.hasOwnProperty.call(
        counts,
        result._id
      )
    ) {
      counts[result._id] = result.total;
    }
  });

  return counts;
};

const getDashboardData = async (
  currentUser
) => {
  const filter =
    buildTicketFilter(currentUser);

  const [
    total,
    statusResults,
    typeResults,
    priorityResults,
    recentTickets,
  ] = await Promise.all([
    Ticket.countDocuments(filter),

    countByField(filter, "status"),

    countByField(filter, "type"),

    countByField(filter, "priority"),

    Ticket.find(filter)
      .select(
        [
          "protocol",
          "title",
          "type",
          "priority",
          "status",
          "requester",
          "createdAt",
        ].join(" ")
      )
      .populate("requester", "name")
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .lean(),
  ]);

  return {
    total,

    countsByStatus: mapCountResults(
      statusResults,
      TICKET_STATUS_VALUES
    ),

    countsByType: mapCountResults(
      typeResults,
      TICKET_TYPE_VALUES
    ),

    countsByPriority: mapCountResults(
      priorityResults,
      TICKET_PRIORITY_VALUES
    ),

    recentTickets,
  };
};

module.exports = {
  getDashboardData,
};