const dashboardService =
  require("../services/dashboard.service");

const {
  TICKET_STATUS_VALUES,
  TICKET_TYPE_VALUES,
  TICKET_STATUS_LABELS,
  TICKET_TYPE_LABELS,
  TICKET_PRIORITY_LABELS,
} = require("../constants/ticket.constants");

const serializeForScript = (value) => {
  return JSON.stringify(value).replace(
    /</g,
    "\\u003c"
  );
};

const showDashboard = async (
  req,
  res,
  next
) => {
  try {
    const dashboard =
      await dashboardService.getDashboardData(
        req.session.user
      );

    const chartData = {
      status: {
        labels: TICKET_STATUS_VALUES.map(
          (value) =>
            TICKET_STATUS_LABELS[value]
        ),

        values: TICKET_STATUS_VALUES.map(
          (value) =>
            dashboard.countsByStatus[value]
        ),
      },

      type: {
        labels: TICKET_TYPE_VALUES.map(
          (value) =>
            TICKET_TYPE_LABELS[value]
        ),

        values: TICKET_TYPE_VALUES.map(
          (value) =>
            dashboard.countsByType[value]
        ),
      },
    };

    return res.render("dashboard/index", {
      title: "Dashboard",
      dashboard,
      statusLabels: TICKET_STATUS_LABELS,
      typeLabels: TICKET_TYPE_LABELS,
      priorityLabels:
        TICKET_PRIORITY_LABELS,
      chartDataJson:
        serializeForScript(chartData),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  showDashboard,
};