// Protects account endpoints. Expects `Authorization: Bearer <token>`.
// On success, attaches the (password-free) user row to req.user.

const db = require("../db");
const { verifyToken } = require("../lib/auth");

module.exports = function requireAuth(req, res, next) {
  const header = req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const user = db
    .prepare("SELECT id, name, email, bio, created_at FROM users WHERE id = ?")
    .get(payload.sub);

  if (!user) {
    return res.status(401).json({ error: "Account no longer exists" });
  }

  req.user = user;
  next();
};
