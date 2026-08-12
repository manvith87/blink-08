# Blink frontend (React)

Same Blink design — marquee bulb-board hero, ticket-stub course
cards, sign-in/profile modal — rebuilt as a proper React app (Vite +
React 18) instead of one static HTML file. Talks to `blink-server`
for course data and accounts.

## Run it

```bash
npm install
cp .env.example .env    # point at your running backend if it's not on localhost:3000
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

Have `blink-server` running too (see its own README) — that's where
courses, signup/login, and profile updates actually come from. If the
backend isn't reachable, the app just shows a small built-in list of
courses instead of an empty page (see `src/data/fallbackCourses.js`).

## Project structure

```
src/
  main.jsx              — mounts the app
  App.jsx               — top-level state: courses, filters, modal open/close
  index.css             — the entire design system (colors, fonts, bulb
                           animation, ticket cards, marquee) — unchanged
                           from the original static site
  api.js                — fetch wrapper for the backend's REST endpoints
  data/
    fallbackCourses.js   — shown only if the backend is unreachable
  context/
    AuthContext.jsx      — login/signup/logout/profile-update + session
                           persistence (localStorage token, re-verified
                           against the backend on load)
  components/
    Header.jsx           — logo, nav links, sign-in button / user pill
    Hero.jsx              — marquee board, headline, stats strip, ticker
    Controls.jsx          — search box, category dropdown, platform pills
    CourseGrid.jsx / CourseCard.jsx — the ticket-stub course cards
    HowItWorks.jsx        — "How the board stays honest" section
    Footer.jsx
    AuthModal.jsx         — login / signup / profile-edit, all in one modal
    Bulb.jsx              — the small blinking dot used all over
```

## Build for production

```bash
npm run build
```

Output goes to `dist/` — deploy that folder to any static host
(Netlify, Vercel, GitHub Pages, S3, etc.). Set `VITE_API_BASE_URL` in
`.env` to your deployed backend's real URL before building, since Vite
bakes env vars in at build time.

## Design fidelity

Nothing about the visual design changed — `index.css` is the same
CSS as the original `blink.html`, just split from inline `<style>`
into its own file. Every class name, color token, and animation is
identical; only the markup generation moved from manual DOM
manipulation to React components.
