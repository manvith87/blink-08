// edX's Course Catalog API requires OAuth2 client-credentials auth.
// You only get real values for EDX_TOKEN_URL / EDX_CATALOG_BASE_URL
// once edX approves your application at https://api.edx.org — the
// approval email includes the exact URLs and any account-specific
// quirks, so treat the defaults in .env.example as a starting point,
// not a guarantee.
//
// Docs: https://course-catalog-api-guide.readthedocs.io/

const cache = require("./cache");

let tokenCache = { token: null, expiresAt: 0 };

function isConfigured() {
  return Boolean(
    process.env.EDX_CLIENT_ID &&
      process.env.EDX_CLIENT_SECRET &&
      process.env.EDX_TOKEN_URL &&
      process.env.EDX_CATALOG_BASE_URL
  );
}

async function getAccessToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const res = await fetch(process.env.EDX_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.EDX_CLIENT_ID,
      client_secret: process.env.EDX_CLIENT_SECRET,
      token_type: "jwt",
    }),
  });

  if (!res.ok) {
    throw new Error(`edX token request failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    // Refresh a little early rather than exactly on expiry.
    expiresAt: Date.now() + (data.expires_in - 30) * 1000,
  };
  return tokenCache.token;
}

async function searchCourses(query, limit = 12) {
  if (!isConfigured()) {
    // Not an error — just means this deployment hasn't been granted
    // edX API access yet. The frontend should quietly skip edX results.
    return [];
  }

  const cacheKey = `edx:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const token = await getAccessToken();
  const params = new URLSearchParams({
    q: query || "free",
    limit: String(limit),
  });

  const res = await fetch(`${process.env.EDX_CATALOG_BASE_URL}/courses/?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`edX API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  const results = (data.results || []).map((course) => ({
    id: `edx-${course.key || course.uuid}`,
    title: course.title,
    platform: "edX",
    partner: course.owners?.[0]?.name || null,
    access: "Free to audit (confirm on course page)",
    url: course.marketing_url || `https://www.edx.org/search?q=${encodeURIComponent(course.title)}`,
  }));

  cache.set(cacheKey, results);
  return results;
}

module.exports = { searchCourses, isConfigured };
