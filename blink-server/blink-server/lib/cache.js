// Tiny in-memory cache so the Coursera/edX/Udemy clients don't
// hammer upstream APIs on every request. Good enough for a small
// single-instance server; swap for Redis if you ever scale out.

const store = new Map();

function get(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

function set(key, value, ttlMs = 5 * 60 * 1000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

module.exports = { get, set };
