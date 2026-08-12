# Blink backend

Express API backed by a real SQLite database — using Node's built-in
`node:sqlite` module, so there's no native package to compile — with
live sync from Coursera and edX. Secrets stay server-side; the
frontend never talks to Coursera/edX/Udemy directly.

**Requires Node 22.13 or later** (`node -v` to check). That's the
version `node:sqlite` became usable without a special flag.

## Setup

```bash
npm install
cp .env.example .env        # set ADMIN_API_KEY at minimum
npm run migrate             # creates blink.db and its tables
npm run seed                # loads the curated fallback list (freeCodeCamp, Khan Academy, MIT OCW, etc.)
npm start
```

Visit `http://localhost:3000/api/courses` — you should see the
seeded curated courses as JSON.

Pull in live Coursera/edX results whenever you like:

```bash
npm run sync
# or a specific topic:
npm run sync -- "machine learning"
```

Coursera works immediately (its Catalog API is public, no key
needed). edX and Udemy stay silent no-ops until you add real
credentials to `.env` — see the comments in `.env.example` for where
to apply.

## Database

SQLite file at `DB_PATH` (default `./blink.db`), opened with Node's
built-in `node:sqlite` module — no native binary, nothing for `npm install`
to compile. Two tables:

- **courses** — every listing, whether curated by hand, added
  manually through the API, or pulled from a live sync. `external_id`
  is the dedupe key (e.g. `coursera-12345`, `fcc-rwd`), so re-seeding
  or re-syncing updates existing rows instead of creating duplicates.
- **sync_log** — one row per sync attempt per source, so you can see
  what succeeded, what failed, and why (`GET /api/status` surfaces
  the last 10).

Schema lives in `db/schema.sql`. `db/index.js` runs it automatically
against a fresh database file, so there's no separate migration
runner to install — `npm run migrate` just makes that step explicit
for deploy scripts.

## API reference

All responses are JSON.

| Method | Path                    | Auth        | Description                                  |
|--------|-------------------------|-------------|-----------------------------------------------|
| GET    | `/api/courses`          | none        | List/search courses. Query params: `platform`, `category`, `q`, `page`, `limit` |
| GET    | `/api/courses/:id`      | none        | Single course by numeric id                   |
| POST   | `/api/courses`          | `x-admin-key` | Add or upsert a course (body: title, platform, url required) |
| PUT    | `/api/courses/:id`      | `x-admin-key` | Edit any subset of fields                     |
| DELETE | `/api/courses/:id`      | `x-admin-key` | Remove a course                               |
| GET    | `/api/courses/platforms`| none        | Distinct platform list                        |
| GET    | `/api/courses/categories`| none       | Distinct category list                        |
| POST   | `/api/sync`             | `x-admin-key` | Pull fresh results from Coursera/edX/Udemy. Optional `?q=` or `{"query": "..."}` |
| GET    | `/api/status`           | none        | Counts by source + recent sync history        |
| POST   | `/api/auth/signup`      | none        | Create an account. Body: `name`, `email`, `password` (8+ chars). Returns `{ token, user }` |
| POST   | `/api/auth/login`       | none        | Body: `email`, `password`. Returns `{ token, user }` |
| GET    | `/api/profile`          | `Bearer` token | Current user's profile                     |
| PUT    | `/api/profile`          | `Bearer` token | Update `name`, `email`, `bio`, or password (send `currentPassword` + `newPassword` together) |

User accounts are a separate auth scheme from the admin key above:
courses are managed with `x-admin-key` (one shared secret, for you as
the operator), while signup/login/profile use per-user JWTs sent as
`Authorization: Bearer <token>`, valid for 30 days. Passwords are
hashed with bcrypt before they ever touch the database.

Example — sign up and use the token:

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada","email":"ada@example.com","password":"correcthorse"}'

curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer <token from the response above>"
```

Example — add a course by hand:

```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -d '{
    "title": "Intro to Rust",
    "platform": "Udemy",
    "category": "Programming",
    "level": "Beginner",
    "access": "Free preview",
    "url": "https://www.udemy.com/courses/search/?q=rust%20free"
  }'
```

Example — trigger a live sync:

```bash
curl -X POST "http://localhost:3000/api/sync?q=python" \
  -H "x-admin-key: $ADMIN_API_KEY"
```

## Background sync (optional)

Set `SYNC_INTERVAL_MINUTES` in `.env` to a number greater than 0 and
the server will re-sync on that cadence automatically while it's
running. Leave it at 0 and trigger syncs manually (`npm run sync`,
the `POST /api/sync` endpoint, or your host's own cron/scheduler) if
you'd rather control exactly when it happens.

## Getting the gated credentials

**edX** — apply at https://api.edx.org. Their API is explicitly for
informational use, not affiliate marketing, which fits this project.

**Udemy** — apply to the Affiliate Program first at
https://www.udemy.com/affiliate/ (runs on Impact, ~3–4 business days
to review), then create an API client at
https://www.udemy.com/instructor/api-clients/.

Both require your own account (and for Udemy, payout/tax details) —
not something I can apply for on your behalf.

## Deploying

Plain Node + a single SQLite file. Runs on Render, Railway, Fly.io,
or any small VPS with **Node 22.13+** — check your host's Node
version setting, since some default to an older LTS. Two things to
get right on whichever host you pick:

1. **Persistent disk for `blink.db`.** Some free tiers wipe the
   filesystem on every redeploy — if that happens to you, either pay
   for a persistent volume/disk, or point `DB_PATH` at one.
2. **Set `CORS_ORIGIN`** to your real frontend's domain instead of
   `*` once you're live.

## Wiring up the frontend

`blink.html` already fetches from `API_BASE_URL` (near the top of its
`<script>` block) and expects exactly this shape:
`{ count, results: [...] }` — which is what `GET /api/courses`
returns. Point that constant at wherever you deploy this and it just
works; no other frontend changes needed.
