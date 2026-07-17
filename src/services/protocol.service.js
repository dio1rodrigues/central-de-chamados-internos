const Counter = require("../models/Counter");

const PROTOCOL_PREFIX = "CH";
const PROTOCOL_SEQUENCE_LENGTH = 6;

const generateTicketProtocol = async (referenceDate = new Date()) => {
  if (
    !(referenceDate instanceof Date) ||
    Number.isNaN(referenceDate.getTime())
  ) {
    throw new Error("Data de referência inválida.");
  }

  const year = referenceDate.getFullYear();
  const counterId = `ticket:${year}`;

  const counter = await Counter.findOneAndUpdate(
    {
      _id: counterId,
    },
    {
      $inc: {
        sequence: 1,
      },
    },
    {
      upsert: true,
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!counter) {
    throw new Error("Não foi possível gerar o protocolo do chamado.");
  }

  const formattedSequence = String(counter.sequence).padStart(
    PROTOCOL_SEQUENCE_LENGTH,
    "0"
  );

  return `${PROTOCOL_PREFIX}-${year}-${formattedSequence}`;
};

module.exports = {
  generateTicketProtocol,
};