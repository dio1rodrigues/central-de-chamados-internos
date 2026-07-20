const {
  TICKET_TYPE_VALUES,
  TICKET_PRIORITY_VALUES,
} = require("../constants/ticket.constants");

const validateCreateTicketInput = (input = {}) => {
  const values = {
    title: typeof input.title === "string"
      ? input.title.trim()
      : "",

    description: typeof input.description === "string"
      ? input.description.trim()
      : "",

    type: typeof input.type === "string"
      ? input.type.trim()
      : "",

    priority: typeof input.priority === "string"
      ? input.priority.trim()
      : "",
  };

  const errors = {};

  if (values.title.length < 5) {
    errors.title = "O título deve possuir pelo menos 5 caracteres.";
  } else if (values.title.length > 120) {
    errors.title = "O título deve possuir no máximo 120 caracteres.";
  }

  if (values.description.length < 10) {
    errors.description =
      "A descrição deve possuir pelo menos 10 caracteres.";
  } else if (values.description.length > 5000) {
    errors.description =
      "A descrição deve possuir no máximo 5000 caracteres.";
  }

  if (!TICKET_TYPE_VALUES.includes(values.type)) {
    errors.type = "Selecione um tipo de chamado válido.";
  }

  if (!TICKET_PRIORITY_VALUES.includes(values.priority)) {
    errors.priority = "Selecione uma prioridade válida.";
  }

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

const validateCommentInput = (input = {}) => {
  const values = {
    message:
      typeof input.message === "string"
        ? input.message.trim()
        : "",
  };

  const errors = {};

  if (!values.message) {
    errors.message = "O comentário é obrigatório.";
  } else if (values.message.length > 2000) {
    errors.message =
      "O comentário deve possuir no máximo 2000 caracteres.";
  }

  return {
    values,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

module.exports = {
  validateCreateTicketInput,
  validateCommentInput,
};