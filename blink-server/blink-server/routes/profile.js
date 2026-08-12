const express = require("express");
const db = require("../db");
const requireAuth = require("../middleware/requireAuth");
const { hashPassword, comparePassword } = require("../lib/auth");

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get("/", requireAuth, (req, res) => {
  res.json(req.user);
});

router.put("/", requireAuth, (req, res) => {
  const { name, email, bio, currentPassword, newPassword } = req.body || {};
  const updates = {};

  if (name !== undefined) {
    if (!name.trim()) return res.status(400).json({ error: "Name can't be empty" });
    updates.name = name.trim();
  }

  if (email !== undefined) {
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "That doesn't look like a valid email" });
    const normalized = email.toLowerCase().trim();
    const clash = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get(normalized, req.user.id);
    if (clash) return res.status(409).json({ error: "That email is already in use" });
    updates.email = normalized;
  }

  if (bio !== undefined) {
    updates.bio = bio;
  }

  if (newPassword) {
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }
    const row = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(req.user.id);
    if (!currentPassword || !comparePassword(currentPassword, row.password_hash)) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    updates.password_hash = hashPassword(newPassword);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const setClause = Object.keys(updates).map((k) => `${k} = @${k}`).join(", ");
  db.prepare(`UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run({
    ...updates,
    id: req.user.id,
  });

  const user = db
    .prepare("SELECT id, name, email, bio, created_at FROM users WHERE id = ?")
    .get(req.user.id);
  res.json(user);
});

module.exports = router;
