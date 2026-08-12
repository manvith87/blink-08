const express = require("express");
const db = require("../db");
const { hashPassword, comparePassword, signToken } = require("../lib/auth");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/signup", (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email and password are required" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "That doesn't look like a valid email" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists" });
  }

  const passwordHash = hashPassword(password);
  const info = db
    .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run(name.trim(), normalizedEmail, passwordHash);

  const user = db
    .prepare("SELECT id, name, email, bio, created_at FROM users WHERE id = ?")
    .get(info.lastInsertRowid);

  res.status(201).json({ token: signToken(user), user });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase().trim());
  if (!row || !comparePassword(password, row.password_hash)) {
    return res.status(401).json({ error: "Incorrect email or password" });
  }

  const user = { id: row.id, name: row.name, email: row.email, bio: row.bio, created_at: row.created_at };
  res.json({ token: signToken(user), user });
});

module.exports = router;
