// Pulls fresh results from each live API client and writes them into
// the database. Each source is isolated: if edX errors out (or isn't
// configured yet), Coursera and Udemy still sync fine, and it's
// recorded in sync_log either way.

const db = require("../db");
const { withTransaction } = require("./withTransaction");
const coursera = require("./courseraClient");
const edx = require("./edxClient");
const udemy = require("./udemyClient");

const upsert = db.prepare(`
  INSERT INTO courses (external_id, title, platform, category, level, duration, access, blurb, url, source)
  VALUES (@external_id, @title, @platform, @category, @level, @duration, @access, @blurb, @url, @source)
  ON CONFLICT(external_id) DO UPDATE SET
    title = excluded.title,
    platform = excluded.platform,
    category = COALESCE(excluded.category, courses.category),
    level = COALESCE(excluded.level, courses.level),
    duration = COALESCE(excluded.duration, courses.duration),
    access = excluded.access,
    blurb = COALESCE(excluded.blurb, courses.blurb),
    url = excluded.url,
    updated_at = CURRENT_TIMESTAMP
`);

const logSync = db.prepare(`
  INSERT INTO sync_log (source, status, message, items_synced) VALUES (?, ?, ?, ?)
`);

async function syncSource(sourceName, fetchFn) {
  try {
    const items = fetchFn ? await fetchFn() : [];
    const writeAll = withTransaction(db, (rows) => {
      rows.forEach((item) =>
        upsert.run({
          external_id: item.id,
          title: item.title,
          platform: item.platform,
          category: item.category || null,
          level: item.level || null,
          duration: item.duration || null,
          access: item.access || null,
          blurb: item.blurb || null,
          url: item.url,
          source: sourceName,
        })
      );
    });
    writeAll(items);
    logSync.run(sourceName, "success", null, items.length);
    return { source: sourceName, count: items.length };
  } catch (err) {
    logSync.run(sourceName, "error", err.message, 0);
    return { source: sourceName, count: 0, error: err.message };
  }
}

async function syncAll(query = "") {
  return Promise.all([
    syncSource("coursera", () => coursera.searchCourses(query)),
    syncSource("edx", () => edx.searchCourses(query)),
    syncSource("udemy", () => udemy.searchCourses(query)),
  ]);
}

module.exports = { syncAll, syncSource };
