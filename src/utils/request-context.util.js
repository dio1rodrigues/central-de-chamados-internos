const getRequestContext = (req) => ({
  ip:
    req.ip ||
    req.socket?.remoteAddress ||
    "",

  userAgent:
    req.get("user-agent") ||
    "",
});

module.exports = {
  getRequestContext,
};