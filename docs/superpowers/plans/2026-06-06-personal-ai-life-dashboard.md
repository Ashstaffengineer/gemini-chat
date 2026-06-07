# Personal AI Life Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a plain HTML personal dashboard with researched content, tabs, and Gemini chat.

**Architecture:** Use static HTML, CSS, and classic JavaScript so the user can open `index.html` directly. Keep curated content in a separate data file and expose small pure helpers for tests.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, Node built-in `node:test`, browser smoke verification.

---

### Task 1: Static Contract Tests

**Files:**
- Create: `package.json`
- Create: `tests/site.test.js`

- [ ] Write tests that require the six requested tabs, complete data categories, source links, and Gemini request helper behavior.
- [ ] Run `npm test` and verify the tests fail because production files do not exist yet.

### Task 2: Website Files

**Files:**
- Create: `index.html`
- Create: `assets/data.js`
- Create: `assets/app.js`
- Create: `assets/styles.css`

- [ ] Implement semantic tabs, dashboard sections, dated source-backed data, Gemini chat, and responsive styles.
- [ ] Run `npm test` until all static tests pass.

### Task 3: Browser Verification

**Files:**
- Modify only if verification reveals a concrete issue.

- [ ] Start a local static server with `python3 -m http.server`.
- [ ] Open the page in the in-app browser.
- [ ] Verify desktop and mobile rendering, tab switching, daily quote controls, source links, and the missing-key Gemini error path.
- [ ] Stop the local server after verification.
