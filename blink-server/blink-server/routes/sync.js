const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const { syncAll } = require("../lib/syncService");

const router = express.Router();

// POST /api/sync            -> pulls "free" as the default search term
// POST /api/sync?q=python   -> pulls a specific topic instead
// (requires x-admin-key header)
router.post("/", adminAuth, async (req, res) => {
  const query = (req.body && req.body.query) || req.query.q || "";
  const results = await syncAll(query);
  res.json({ synced_at: new Date().toISOString(), query: query || "(default)", results });
});

module.exports = router;
