const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function loadData() {
  const context = {
    console,
    window: {}
  };
  context.globalThis = context.window;
  vm.runInNewContext(read("assets/data.js"), context, { filename: "assets/data.js" });
  return context.window.APP_DATA;
}

function loadApp(data) {
  const context = {
    console,
    window: { APP_DATA: data }
  };
  context.globalThis = context.window;
  vm.runInNewContext(read("assets/app.js"), context, { filename: "assets/app.js" });
  return context.window.AIHubApp;
}

test("index exposes the requested tabs and static assets", () => {
  const html = read("index.html");
  const labels = [
    "AI Updates",
    "Gemini Chat",
    "Health & Fitness",
    "Travel & Vlogs",
    "Motivation",
    "Movies & Series",
    "Nano Banana"
  ];

  for (const label of labels) {
    const htmlLabel = label.replace(/&/g, "&amp;");
    assert.match(html, new RegExp(`>${htmlLabel}<`), `${label} tab is rendered`);
  }

  assert.equal((html.match(/role="tab"/g) || []).length, labels.length);
  assert.equal((html.match(/class="tab-icon/g) || []).length, labels.length);
  assert.match(html, /assets\/styles\.css/);
  assert.match(html, /assets\/data\.js/);
  assert.match(html, /assets\/app\.js/);
  assert.doesNotMatch(html, /type="module"/, "page should open directly from file://");
});

test("curated dashboard data covers every requested section with sources", () => {
  const data = loadData();
  assert.equal(data.meta.generatedOn, "2026-06-06");
  assert.deepEqual(
    Array.from(data.tabs.map((tab) => tab.id)),
    ["ai", "gemini", "health", "travel", "motivation", "streaming", "nano-banana"]
  );

  assert.ok(data.aiUpdates.length >= 8);
  assert.ok(data.aiUpdates.some((item) => item.lab === "OpenAI"));
  assert.ok(data.aiUpdates.some((item) => item.lab === "Anthropic"));
  assert.ok(data.aiUpdates.some((item) => item.lab === "Google DeepMind"));
  assert.ok(data.aiUpdates.some((item) => item.lab === "Reddit"));

  for (const item of data.aiUpdates) {
    assert.match(item.source.url, /^https:\/\//, `${item.title} has a source URL`);
    assert.ok(item.takeaway.length > 30, `${item.title} has a useful takeaway`);
  }

  assert.deepEqual(
    Array.from(data.health.sections.map((section) => section.id)),
    ["workout", "hair", "food"]
  );
  assert.ok(data.health.sections.every((section) => section.sources.length >= 2));

  assert.ok(data.travel.destinations.length >= 8);
  assert.ok(data.travel.destinations.every((place) => place.vlogAngle && place.sources.length >= 1));

  const platforms = Array.from(data.streaming.platforms.map((platform) => platform.name));
  assert.deepEqual(platforms, ["Netflix", "Hulu", "Apple TV", "HBO Max"]);
  assert.ok(data.streaming.platforms.every((platform) => platform.items.length >= 5));
  assert.ok(data.streaming.platforms.every((platform) => platform.logoText && platform.brandClass));
  assert.ok(data.streaming.platforms.every((platform) => /^https:\/\//.test(platform.heroImage)));
  assert.equal(data.streaming.ratingFallback.imdb, "TBA");
  assert.equal(data.streaming.ratingFallback.rottenTomatoes, "TBA");
  assert.match(data.streaming.liveRefresh.explainer, /official/i);
  assert.ok(data.streaming.liveRefresh.sourcePriority.length >= 4);

  assert.ok(data.motivation.quotes.length >= 24);
  assert.ok(data.motivation.quotes.every((quote) => quote.text.length >= 20));

  assert.ok(data.nanoBanana.models.length >= 7);
  assert.ok(data.nanoBanana.models.some((model) => /Nano Banana 2/.test(model.label)));
  assert.ok(data.nanoBanana.models.some((model) => /Nano Banana Pro/.test(model.label)));
  assert.ok(data.nanoBanana.features.every((feature) => feature.title && feature.description));
});

test("Gemini request helper builds a browser REST call without exposing a committed key", () => {
  const data = loadData();
  const app = loadApp(data);
  const request = app.buildGeminiRequest({
    apiKey: "test-key",
    model: "gemini-3.5-flash",
    userText: "What should I read in AI today?",
    history: [
      { role: "user", text: "Summarize vibe coding." },
      { role: "model", text: "Focus on tool use and review." }
    ],
    context: "Current tab: AI Updates"
  });

  assert.match(request.url, /gemini-3\.5-flash:generateContent$/);
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers["x-goog-api-key"], "test-key");
  assert.equal(request.options.headers["Content-Type"], "application/json");

  const body = JSON.parse(request.options.body);
  assert.match(body.system_instruction.parts[0].text, /personal AI life dashboard/i);
  assert.ok(
    body.contents.some((entry) => entry.parts.some((part) => part.text.includes("What should I read")))
  );
});

test("streaming refresh request uses Gemini Search grounding for current OTT trends", () => {
  const data = loadData();
  const app = loadApp(data);
  const request = app.buildStreamingRefreshRequest({
    apiKey: "test-key",
    model: "gemini-3.5-flash"
  });

  assert.match(request.url, /gemini-3\.5-flash:generateContent$/);
  assert.equal(request.options.headers["x-goog-api-key"], "test-key");

  const body = JSON.parse(request.options.body);
  assert.deepEqual(body.tools, [{ google_search: {} }]);
  assert.match(body.contents[0].parts[0].text, /Netflix/i);
  assert.match(body.contents[0].parts[0].text, /Hulu/i);
  assert.match(body.contents[0].parts[0].text, /Apple TV/i);
  assert.match(body.contents[0].parts[0].text, /HBO Max/i);
  assert.match(body.contents[0].parts[0].text, /official platform-owned/i);
  assert.match(body.contents[0].parts[0].text, /IMDb/i);
  assert.match(body.contents[0].parts[0].text, /Rotten Tomatoes/i);
  assert.match(body.contents[0].parts[0].text, /ratings/);
});

test("streaming refresh parser accepts grounded JSON text and citations", () => {
  const data = loadData();
  const app = loadApp(data);
  const parsed = app.parseStreamingRefreshResponse({
    candidates: [
      {
        content: {
          parts: [
            {
              text: "```json\n{\"platforms\":[{\"name\":\"Netflix\",\"items\":[{\"rank\":1,\"title\":\"Example Movie\",\"type\":\"Movie\",\"signal\":\"Official Top 10\",\"confidence\":\"Official\",\"ratings\":{\"imdb\":\"7.8/10\",\"rottenTomatoes\":\"91%\"}}]}]}\n```"
            }
          ]
        },
        groundingMetadata: {
          webSearchQueries: ["Netflix top 10 United States today"],
          groundingChunks: [
            { web: { uri: "https://www.netflix.com/tudum/top10/united-states", title: "Netflix Top 10" } }
          ],
          searchEntryPoint: {
            renderedContent: "<div>Search suggestions</div>"
          }
        }
      }
    ]
  });

  assert.equal(parsed.platforms[0].name, "Netflix");
  assert.equal(parsed.platforms[0].items[0].title, "Example Movie");
  assert.equal(parsed.platforms[0].items[0].ratings.imdb, "7.8/10");
  assert.equal(parsed.platforms[0].items[0].ratings.rottenTomatoes, "91%");
  assert.equal(parsed.queries[0], "Netflix top 10 United States today");
  assert.equal(parsed.sources[0].url, "https://www.netflix.com/tudum/top10/united-states");
  assert.match(parsed.searchHtml, /Search suggestions/);
});

test("daily quote index is deterministic and bounded", () => {
  const data = loadData();
  const app = loadApp(data);
  const first = app.getDailyQuoteIndex(new Date("2026-06-06T12:00:00-07:00"), data.motivation.quotes.length);
  const second = app.getDailyQuoteIndex(new Date("2026-06-06T23:59:00-07:00"), data.motivation.quotes.length);

  assert.equal(first, second);
  assert.ok(first >= 0);
  assert.ok(first < data.motivation.quotes.length);
});

test("project files do not contain a Gemini API key", () => {
  const files = ["index.html", "assets/data.js", "assets/app.js", "assets/styles.css"];
  for (const file of files) {
    assert.doesNotMatch(read(file), /AIza[0-9A-Za-z_-]{20,}/, `${file} should not contain an API key`);
  }
});

test("streaming page renders production-style visual rails", () => {
  const appSource = read("assets/app.js");
  const css = read("assets/styles.css");

  assert.match(appSource, /streaming-showcase/);
  assert.match(appSource, /brand-logo/);
  assert.match(appSource, /poster-card/);
  assert.match(appSource, /poster-image/);
  assert.match(appSource, /icon-button/);
  assert.match(appSource, /rating-stack/);
  assert.match(appSource, /rating-badge/);
  assert.match(appSource, /imdb-badge/);
  assert.match(appSource, /rt-badge/);

  assert.match(css, /\.streaming-showcase/);
  assert.match(css, /\.brand-logo/);
  assert.match(css, /\.poster-rail/);
  assert.match(css, /\.poster-card/);
  assert.match(css, /\.poster-image/);
  assert.match(css, /\.rating-stack/);
  assert.match(css, /\.rating-badge/);
  assert.match(css, /\.imdb-badge/);
  assert.match(css, /\.rt-badge/);
  assert.match(css, /\.poster-actions\s*{[\s\S]*flex-wrap:\s*wrap/);
  assert.match(css, /\.play-button\s*{[\s\S]*min-width:\s*72px/);
});

test("Nano Banana tab preserves the previous image generation project", () => {
  const data = loadData();
  const app = loadApp(data);
  const html = read("index.html");
  const appSource = read("assets/app.js");
  const css = read("assets/styles.css");

  assert.match(html, /data-tab="nano-banana"/);
  assert.match(html, /id="panel-nano-banana"/);
  assert.match(appSource, /renderNanoBananaPanel/);
  assert.match(appSource, /nano-image-upload/);
  assert.match(appSource, /processNanoImageFiles/);
  assert.match(appSource, /sendNanoBananaMessage/);
  assert.match(appSource, /clearNanoBananaChat/);
  assert.match(appSource, /inlineData/);
  assert.match(appSource, /responseModalities/);
  assert.match(css, /\.nano-workbench/);
  assert.match(css, /\.nano-chat-container/);
  assert.match(css, /\.nano-upload-btn/);

  const request = app.buildNanoBananaRequest({
    model: "models/gemini-3.1-flash-image-preview",
    userText: "Generate a cinematic product image",
    images: [
      {
        mimeType: "image/png",
        base64: "abc123"
      }
    ],
    history: []
  });

  assert.match(request.url, /models\/gemini-3\.1-flash-image-preview:generateContent/);
  const body = JSON.parse(request.options.body);
  assert.deepEqual(body.generationConfig.responseModalities, ["TEXT", "IMAGE"]);
  assert.deepEqual(body.contents[0].parts[0], {
    inlineData: {
      mimeType: "image/png",
      data: "abc123"
    }
  });
  assert.deepEqual(body.contents[0].parts[1], { text: "Generate a cinematic product image" });
});
