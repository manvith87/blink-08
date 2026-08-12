// Loads the hand-curated list (freeCodeCamp, Khan Academy, MIT OCW,
// etc.) into the database. Safe to re-run any time — it upserts on
// external_id, so re-seeding just refreshes those rows instead of
// duplicating them.

require("dotenv").config();
const db = require("./index");
const staticCourses = require("../lib/staticCourses");
const { withTransaction } = require("../lib/withTransaction");

const upsert = db.prepare(`
  INSERT INTO courses (external_id, title, platform, category, level, duration, access, blurb, url, source)
  VALUES (@id, @title, @platform, @category, @level, @duration, @access, @blurb, @url, 'curated')
  ON CONFLICT(external_id) DO UPDATE SET
    title = excluded.title,
    platform = excluded.platform,
    category = excluded.category,
    level = excluded.level,
    duration = excluded.duration,
    access = excluded.access,
    blurb = excluded.blurb,
    url = excluded.url,
    updated_at = CURRENT_TIMESTAMP
`);

const seedAll = withTransaction(db, (items) => {
  items.forEach((item) => upsert.run(item));
});

seedAll(staticCourses);
console.log(`Seeded ${staticCourses.length} curated courses into ${process.env.DB_PATH || "blink.db"}.`);
process.exit(0);
