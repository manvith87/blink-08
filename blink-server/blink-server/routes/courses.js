const express = require("express");
const db = require("../db");
const adminAuth = require("../middleware/adminAuth");
const slugify = require("../lib/slugify");

const router = express.Router();

// GET /api/courses?platform=Coursera&category=Programming&q=python&page=1&limit=24
router.get("/", (req, res) => {
  const { platform, category, q } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 50);
  const offset = (page - 1) * limit;

  const where = [];
  const params = {};

  if (platform && platform.toLowerCase() !== "all") {
    where.push("platform = @platform");
    params.platform = platform;
  }
  if (category && category.toLowerCase() !== "all") {
    where.push("category = @category");
    params.category = category;
  }
  if (q) {
    where.push("(title LIKE @q OR blurb LIKE @q OR platform LIKE @q)");
    params.q = `%${q}%`;
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const results = db
    .prepare(`SELECT * FROM courses ${whereClause} ORDER BY updated_at DESC LIMIT @limit OFFSET @offset`)
    .all({ ...params, limit, offset });

  const { count } = db
    .prepare(`SELECT COUNT(*) AS count FROM courses ${whereClause}`)
    .get(params);

  res.json({ count, page, limit, results });
});

router.get("/platforms", (req, res) => {
  const rows = db.prepare("SELECT DISTINCT platform FROM courses ORDER BY platform").all();
  res.json(rows.map((r) => r.platform));
});

router.get("/categories", (req, res) => {
  const rows = db
    .prepare("SELECT DISTINCT category FROM courses WHERE category IS NOT NULL ORDER BY category")
    .all();
  res.json(rows.map((r) => r.category));
});

router.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Course not found" });
  res.json(row);
});

// POST /api/courses  (requires x-admin-key header)
router.post("/", adminAuth, (req, res) => {
  const { title, platform, category, level, duration, access, blurb, url } = req.body;

  if (!title || !platform || !url) {
    return res.status(400).json({ error: "title, platform and url are required" });
  }

  const externalId = req.body.external_id || `manual-${slugify(platform)}-${slugify(title)}`;

  db.prepare(`
    INSERT INTO courses (external_id, title, platform, category, level, duration, access, blurb, url, source)
    VALUES (@externalId, @title, @platform, @category, @level, @duration, @access, @blurb, @url, 'manual')
    ON CONFLICT(external_id) DO UPDATE SET
      title = excluded.title, platform = excluded.platform, category = excluded.category,
      level = excluded.level, duration = excluded.duration, access = excluded.access,
      blurb = excluded.blurb, url = excluded.url, updated_at = CURRENT_TIMESTAMP
  `).run({ externalId, title, platform, category, level, duration, access, blurb, url });

  const row = db.prepare("SELECT * FROM courses WHERE external_id = ?").get(externalId);
  res.status(201).json(row);
});

// PUT /api/courses/:id  (requires x-admin-key header)
router.put("/:id", adminAuth, (req, res) => {
  const existing = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Course not found" });

  const editable = ["title", "platform", "category", "level", "duration", "access", "blurb", "url"];
  const updates = {};
  editable.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No editable fields provided" });
  }

  const setClause = Object.keys(updates).map((k) => `${k} = @${k}`).join(", ");
  db.prepare(`UPDATE courses SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run({
    ...updates,
    id: req.params.id,
  });

  res.json(db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id));
});

// DELETE /api/courses/:id  (requires x-admin-key header)
router.delete("/:id", adminAuth, (req, res) => {
  const info = db.prepare("DELETE FROM courses WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: "Course not found" });
  res.status(204).send();
});

module.exports = router;
