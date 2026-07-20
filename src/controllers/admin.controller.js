const auditService = require("../services/audit.service");

const {
  AUDIT_ACTION_VALUES,
  AUDIT_ACTION_LABELS,
} = require("../constants/audit.constants");

const showAdminPanel = (req, res) => {
  return res.render("admin/index", {
    title: "Área administrativa",
  });
};

const showAuditLogs = async (req, res, next) => {
  try {
    const requestedAction =
      typeof req.query.action === "string"
        ? req.query.action.trim()
        : "";

    const selectedAction =
      AUDIT_ACTION_VALUES.includes(requestedAction)
        ? requestedAction
        : "";

    const logs = await auditService.listAuditLogs({
      action: selectedAction,
    });

    const actionOptions =
      AUDIT_ACTION_VALUES.map((value) => ({
        value,
        label: AUDIT_ACTION_LABELS[value],
      }));

    return res.render("admin/audit-logs", {
      title: "Auditoria",
      logs,
      selectedAction,
      actionOptions,
      actionLabels: AUDIT_ACTION_LABELS,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  showAdminPanel,
  showAuditLogs,
};