const mongoose = require("mongoose");

const AuditLog = require("../models/AuditLog");

const {
  AUDIT_ACTION_VALUES,
} = require("../constants/audit.constants");

const normalizeText = (value, maxLength) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
};

const recordAudit = async ({
  action,
  actorId = null,
  ticketId = null,
  description,
  metadata = {},
  ip = "",
  userAgent = "",
}) => {
  try {
    if (!AUDIT_ACTION_VALUES.includes(action)) {
      throw new Error("Ação de auditoria inválida.");
    }

    const auditData = {
      action,
      description: normalizeText(description, 1000),
      metadata:
        metadata &&
        typeof metadata === "object" &&
        !Array.isArray(metadata)
          ? metadata
          : {},
      ip: normalizeText(ip, 100),
      userAgent: normalizeText(userAgent, 500),
    };

    if (actorId) {
      if (!mongoose.isValidObjectId(actorId)) {
        throw new Error("Usuário de auditoria inválido.");
      }

      auditData.actor = actorId;
    }

    if (ticketId) {
      if (!mongoose.isValidObjectId(ticketId)) {
        throw new Error("Chamado de auditoria inválido.");
      }

      auditData.ticket = ticketId;
    }

    return await AuditLog.create(auditData);
  } catch (error) {
    console.error(
      `[AUDITORIA] Não foi possível registrar ${action}:`,
      error.message
    );

    return null;
  }
};

const listAuditLogs = async ({
  action = "",
  limit = 200,
} = {}) => {
  const filter = {};

  if (AUDIT_ACTION_VALUES.includes(action)) {
    filter.action = action;
  }

  return AuditLog.find(filter)
    .populate("actor", "name email role")
    .populate("ticket", "protocol title")
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .lean();
};

module.exports = {
  recordAudit,
  listAuditLogs,
};