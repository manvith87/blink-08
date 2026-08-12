// Udemy shut off general Affiliate API access on 1/1/2025. You now
// need to be accepted into the Udemy Affiliate Program (via Impact,
// https://www.udemy.com/affiliate/) before Udemy will let you create
// an API client at https://www.udemy.com/instructor/api-clients/.
//
// Until you've been approved, this client just returns an empty list
// so the rest of the site keeps working off the curated fallback.

const cache = require("./cache");

function isConfigured() {
  return Boolean(process.env.UDEMY_CLIENT_ID && process.env.UDEMY_CLIENT_SECRET);
}

async function searchCourses(query, limit = 12) {
  if (!isConfigured()) return [];

  const cacheKey = `udemy:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const auth = Buffer.from(
    `${process.env.UDEMY_CLIENT_ID}:${process.env.UDEMY_CLIENT_SECRET}`
  ).toString("base64");

  const params = new URLSearchParams({
    search: query || "free",
    price: "price-free", // Udemy's own "free" price filter
    page_size: String(limit),
  });

  const res = await fetch(`https://www.udemy.com/api-2.0/courses/?${params.toString()}`, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) {
    throw new Error(`Udemy API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  const results = (data.results || []).map((course) => ({
    id: `udemy-${course.id}`,
    title: course.title,
    platform: "Udemy",
    partner: null,
    access: "Fully free",
    url: `https://www.udemy.com${course.url}`,
  }));

  cache.set(cacheKey, results);
  return results;
}

module.exports = { searchCourses, isConfigured };
