// Coursera's Catalog API is public and needs no key at all.
// Docs: https://build.coursera.org/app-platform/catalog/
//
// Note on copyright: Coursera owns the copyright on catalog text
// (descriptions, graphics) on behalf of its university partners, and
// the API does not grant a license to republish that material. So we
// only surface the title, a link back to Coursera, and structural
// fields (slug, partner) — we never store or show their description
// text verbatim.

const cache = require("./cache");

const BASE_URL = "https://api.coursera.org/api/courses.v1";

async function searchCourses(query, limit = 12) {
  const cacheKey = `coursera:${query}:${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const params = new URLSearchParams({
    q: "search",
    query: query || "free",
    limit: String(limit),
    fields: "slug,partnerIds,photoUrl",
    includes: "partners",
  });

  const res = await fetch(`${BASE_URL}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Coursera API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  const partnersById = {};
  (data.linked?.["partners.v1"] || []).forEach((p) => {
    partnersById[p.id] = p.name;
  });

  const results = (data.elements || []).map((course) => ({
    id: `coursera-${course.id}`,
    title: course.name,
    platform: "Coursera",
    partner: (course.partnerIds || []).map((id) => partnersById[id]).filter(Boolean)[0] || null,
    // Coursera courses are broadly free to audit, but this is a
    // heuristic, not a guarantee pulled from the API — always let
    // the person confirm on the course page itself.
    access: "Free to audit (confirm on course page)",
    url: `https://www.coursera.org/learn/${course.slug}`,
  }));

  cache.set(cacheKey, results);
  return results;
}

module.exports = { searchCourses };
