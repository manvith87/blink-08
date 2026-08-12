// Guards write endpoints (add/edit/delete a course, trigger a sync).
// Send the key in an `x-admin-key` header. This is intentionally
// simple — one shared secret, not a full user/login system — since
// Blink only needs one operator (you) to be able to manage the list.

module.exports = function adminAuth(req, res, next) {
  if (!process.env.ADMIN_API_KEY) {
    return res.status(500).json({
      error: "Server misconfigured: ADMIN_API_KEY is not set in .env",
    });
  }

  const provided = req.header("x-admin-key");
  if (provided !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Missing or invalid x-admin-key header" });
  }

  next();
};
