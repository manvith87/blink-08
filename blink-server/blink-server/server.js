require("dotenv").config();
const express = require("express");
const cors = require("cors");

const db = require("./db"); // requiring this ensures the schema exists
const coursesRouter = require("./routes/courses");
const syncRouter = require("./routes/sync");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/api/status", (req, res) => {
  const { total } = db.prepare("SELECT COUNT(*) AS total FROM courses").get();
  const bySource = db
    .prepare("SELECT source, COUNT(*) AS count FROM courses GROUP BY source")
    .all();
  const recentSyncs = db
    .prepare("SELECT * FROM sync_log ORDER BY synced_at DESC LIMIT 10")
    .all();

  res.json({
    totalCourses: total,
    bySource,
    recentSyncs,
    edxConfigured: require("./lib/edxClient").isConfigured(),
    udemyConfigured: require("./lib/udemyClient").isConfigured(),
  });
});

app.use("/api/courses", coursesRouter);
app.use("/api/sync", syncRouter);
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Blink backend running at http://localhost:${PORT}`);
  console.log(`Courses:  http://localhost:${PORT}/api/courses`);
  console.log(`Status:   http://localhost:${PORT}/api/status`);
});

// Optional background refresh — set SYNC_INTERVAL_MINUTES in .env to
// enable. Leave unset (or 0) to only sync via `npm run sync` or the
// POST /api/sync endpoint.
const intervalMinutes = Number(process.env.SYNC_INTERVAL_MINUTES || 0);
if (intervalMinutes > 0) {
  const { syncAll } = require("./lib/syncService");
  console.log(`Background sync enabled: every ${intervalMinutes} minute(s).`);
  setInterval(() => {
    syncAll()
      .then((results) => console.log("[scheduled sync]", results))
      .catch((err) => console.error("[scheduled sync] failed:", err.message));
  }, intervalMinutes * 60 * 1000);
}
