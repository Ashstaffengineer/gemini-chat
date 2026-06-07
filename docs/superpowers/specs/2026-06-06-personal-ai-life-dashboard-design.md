# Personal AI Life Dashboard Design

Date: 2026-06-06

## Goal

Build a single-file-openable website for staying current on AI, asking Gemini questions with the user's own API key, reviewing health and fitness guidance, finding US travel ideas, reading daily motivation, and scanning currently trending movies and series by streaming platform.

## Constraints

- The site must work from `index.html` without a framework or build step.
- The Gemini key must never be committed. Because the user asked for plain HTML, Gemini calls will happen in the browser; the UI must make this trade-off clear and avoid persistence unless the user opts in.
- Current data should be dated and sourced. Static snapshots cannot promise permanent freshness, so the site will include source links and Gemini prompts for follow-up research.
- The design should feel like a focused personal dashboard, not a marketing landing page.

## Architecture

- `index.html` provides semantic structure, tab navigation, content panels, and the global chat surface.
- `assets/data.js` holds curated dated content, links, prompt chips, quotes, and streaming rows.
- `assets/app.js` renders tab content, handles accessibility-friendly tabs, daily quote rotation, local key handling, Gemini REST calls, and error states.
- `assets/styles.css` owns all layout, responsive rules, colors, typography, and interaction states.
- `tests/site.test.js` validates structure, data completeness, API request construction, and the absence of committed secrets.

## UX

The first screen opens on the AI tab. Tabs cover AI Updates, Gemini Chat, Health & Fitness, Travel & Vlogs, Motivation, and Movies & Series. A compact chat panel remains available across the site and seeds Gemini with the current tab context. Content cards include source links, "ask Gemini" prompts, and quick filters where useful.

## Research Summary

- AI content focuses on OpenAI GPT-5.5/Codex, Anthropic Claude Opus 4.8, Google Gemini 3.5/Antigravity, GitHub Copilot coding agent updates, and Reddit's mixed reaction to vibe coding quality/cost.
- Health content uses CDC physical activity guidance, Harvard Healthy Eating Plate, CDC/AAD scalp guidance, and cautious Reddit-derived hair-care themes for Indian men.
- Travel content blends 2026 professional travel lists with Reddit recommendations for underrated US destinations and national-park practicality.
- Streaming content provides dated rows for Netflix, Hulu, Apple TV, and HBO Max using official or current popularity sources where available.

## Error Handling

- Gemini chat blocks empty prompts and missing keys.
- API responses handle HTTP failures, quota/key errors, missing model text, and network failures.
- External links open in a new tab with safe `rel` attributes.
- The interface remains usable without network access except for external images, source links, and Gemini calls.

## Testing

Use Node's built-in test runner for static validation, plus a browser smoke test after implementation. The browser check should verify that tabs switch, quote rotation controls work, the chat handles missing API key cleanly, and the page renders without layout overflow on desktop and mobile.
