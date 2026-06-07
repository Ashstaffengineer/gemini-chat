(function dashboardApp(root) {
  "use strict";

  var data = root.APP_DATA || {};
  var chatHistory = [];
  var currentTab = "ai";
  var quoteIndex = 0;
  var streamingRefresh = {
    status: "idle",
    updatedAt: "",
    platforms: null,
    sources: [],
    queries: [],
    searchHtml: "",
    rawText: "",
    error: ""
  };
  var nanoBananaHistory = [];
  var nanoBananaImages = [];

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function markdownLite(value) {
    return escapeHtml(value)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n{2,}/g, "</p><p>")
      .replace(/\n/g, "<br>");
  }

  function sourceLink(source) {
    return '<a href="' + escapeAttr(source.url) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(source.label) + "</a>";
  }

  function sourceLinks(sources) {
    if (!sources || !sources.length) return "";
    return '<div class="source-row">' + sources.map(sourceLink).join("") + "</div>";
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "streaming";
  }

  function posterImage(item, platform) {
    return item.image || "https://picsum.photos/seed/" + encodeURIComponent(slugify(platform.name + "-" + item.title)) + "/360/540";
  }

  function ratingFallback(key) {
    var fallback = data.streaming && data.streaming.ratingFallback;
    return String((fallback && fallback[key]) || "TBA");
  }

  function normalizeRatings(ratings) {
    var input = ratings || {};
    return {
      imdb: String(input.imdb || input.imdbRating || ratingFallback("imdb")),
      rottenTomatoes: String(input.rottenTomatoes || input.rottenTomatoesRating || input.rt || input.rotten_tomatoes || ratingFallback("rottenTomatoes"))
    };
  }

  function renderRatingBadges(item) {
    var ratings = normalizeRatings(item.ratings);
    return [
      '<div class="rating-stack" aria-label="IMDb and Rotten Tomatoes ratings">',
      '<span class="rating-badge imdb-badge" aria-label="IMDb rating ' + escapeAttr(ratings.imdb) + '"><strong>IMDb</strong><span>' + escapeHtml(ratings.imdb) + '</span></span>',
      '<span class="rating-badge rt-badge" aria-label="Rotten Tomatoes rating ' + escapeAttr(ratings.rottenTomatoes) + '"><strong>RT</strong><span>' + escapeHtml(ratings.rottenTomatoes) + '</span></span>',
      '</div>'
    ].join("");
  }

  function icon(name) {
    var paths = {
      play: '<path d="M8 5v14l11-7z"></path>',
      plus: '<path d="M12 5v14M5 12h14"></path>',
      info: '<path d="M12 16v-4M12 8h.01"></path><circle cx="12" cy="12" r="9"></circle>',
      refresh: '<path d="M20 6v6h-6"></path><path d="M4 18v-6h6"></path><path d="M19 12a7 7 0 0 0-12-4.9L4 10"></path><path d="M5 12a7 7 0 0 0 12 4.9L20 14"></path>'
    };
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (paths[name] || paths.info) + '</svg>';
  }

  function getTab(tabId) {
    return (data.tabs || []).find(function(tab) {
      return tab.id === tabId;
    }) || (data.tabs || [])[0];
  }

  function getDailyQuoteIndex(date, total) {
    if (!total) return 0;
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: (data.meta && data.meta.timezone) || "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date || new Date());
    var dateKey = ["year", "month", "day"].map(function(type) {
      return parts.find(function(part) {
        return part.type === type;
      }).value;
    }).join("-");
    var hash = 0;
    for (var i = 0; i < dateKey.length; i += 1) {
      hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
    }
    return hash % total;
  }

  function buildGeminiRequest(input) {
    var model = input.model || (data.gemini && data.gemini.defaultModel) || "gemini-3.5-flash";
    var systemText = [
      "You are a concise, grounded assistant inside a personal AI life dashboard.",
      "Use the provided page context when relevant. If the user asks for current news, say when you need live verification.",
      "For health, fitness, hair, food, travel, and entertainment, be practical and avoid pretending to be a doctor, lawyer, or paid travel agent.",
      "Never ask for or store API keys."
    ].join(" ");
    var contents = [];

    (input.history || []).slice(-8).forEach(function(message) {
      contents.push({
        role: message.role === "model" ? "model" : "user",
        parts: [{ text: message.text }]
      });
    });

    contents.push({
      role: "user",
      parts: [{
        text: "Page context:\n" + (input.context || "General dashboard") + "\n\nQuestion:\n" + input.userText
      }]
    });

    return {
      url: "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent",
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": input.apiKey
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemText }]
          },
          contents: contents,
          generationConfig: {
            temperature: 0.45,
            maxOutputTokens: 1200
          }
        })
      }
    };
  }

  function buildStreamingRefreshRequest(input) {
    var model = input.model || (data.gemini && data.gemini.defaultModel) || "gemini-3.5-flash";
    var prompt = [
      "Refresh the current United States OTT trending movies and web series for Netflix, Hulu, Apple TV, and HBO Max.",
      "Use Google Search grounding. Prioritize official platform-owned sources. Only mark confidence as Official when the source is owned by the platform or its parent company.",
      "If a platform does not expose an official public trending list, use the best current reputable web signal and mark confidence as Verified web signal or Unofficial signal.",
      "Include current IMDb and Rotten Tomatoes ratings when discoverable from reputable sources. Use TBA when a rating is unavailable or uncertain.",
      "Return JSON only, no markdown.",
      "Schema:",
      "{\"platforms\":[{\"name\":\"Netflix\",\"items\":[{\"rank\":1,\"title\":\"Title\",\"type\":\"Movie or Series\",\"signal\":\"Why this is trending and source basis\",\"confidence\":\"Official or Verified web signal or Unofficial signal\",\"ratings\":{\"imdb\":\"7.8/10 or TBA\",\"rottenTomatoes\":\"92% or TBA\"}}]}]}",
      "Include 5 to 8 items per platform. Keep titles current as of today."
    ].join("\n");

    return {
      url: "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent",
      options: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": input.apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          tools: [{ google_search: {} }],
          generationConfig: {
            temperature: 0.15,
            maxOutputTokens: 2200
          }
        })
      }
    };
  }

  function normalizeNanoModel(model) {
    var fallback = data.nanoBanana && data.nanoBanana.defaultModel;
    var value = model || fallback || "models/gemini-3.1-flash-image-preview";
    return value.indexOf("models/") === 0 ? value : "models/" + value;
  }

  function buildNanoBananaRequest(input) {
    var model = normalizeNanoModel(input.model);
    var parts = [];

    (input.images || []).forEach(function(image) {
      if (!image || !image.base64 || !image.mimeType) return;
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.base64
        }
      });
    });

    if (input.userText) {
      parts.push({ text: input.userText });
    }

    var contents = (input.history || []).slice(-8);
    contents.push({
      role: "user",
      parts: parts
    });

    var headers = {
      "Content-Type": "application/json"
    };
    if (input.apiKey) headers["x-goog-api-key"] = input.apiKey;

    return {
      url: "https://generativelanguage.googleapis.com/v1beta/" + model + ":generateContent",
      options: {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseModalities: model.indexOf("image") >= 0 ? ["TEXT", "IMAGE"] : ["TEXT"]
          }
        })
      }
    };
  }

  function extractGeminiText(responseJson) {
    var candidates = responseJson && responseJson.candidates;
    if (!candidates || !candidates.length) {
      if (responseJson && responseJson.promptFeedback) {
        return "Gemini did not return text. The prompt may have been blocked or filtered.";
      }
      return "Gemini returned no text.";
    }
    var parts = candidates[0].content && candidates[0].content.parts;
    if (!parts || !parts.length) return "Gemini returned an empty response.";
    return parts.map(function(part) {
      return part.text || "";
    }).join("").trim() || "Gemini returned an empty response.";
  }

  function stripJsonFence(text) {
    var cleaned = String(text || "").trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    var firstBrace = cleaned.indexOf("{");
    var lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
    return cleaned;
  }

  function normalizeStreamingPlatform(platform) {
    var fallback = (data.streaming.platforms || []).find(function(existingPlatform) {
      return existingPlatform.name === platform.name;
    }) || {};
    return {
      name: String(platform.name || "Unknown"),
      logoText: String(platform.logoText || fallback.logoText || platform.name || "OTT"),
      brandClass: String(platform.brandClass || fallback.brandClass || "brand-generic"),
      heroImage: String(platform.heroImage || fallback.heroImage || "https://picsum.photos/seed/streaming/1400/760"),
      heroAlt: String(platform.heroAlt || fallback.heroAlt || "Streaming service backdrop"),
      sourceNote: String(platform.sourceNote || fallback.sourceNote || "Refreshed with Gemini Search grounding."),
      items: (platform.items || []).slice(0, 8).map(function(item, index) {
        return {
          rank: Number(item.rank || index + 1),
          title: String(item.title || "Untitled"),
          type: String(item.type || "Movie or Series"),
          signal: String(item.signal || "Refreshed with Gemini Search grounding."),
          confidence: String(item.confidence || "Verified web signal"),
          ratings: normalizeRatings(item.ratings)
        };
      })
    };
  }

  function parseStreamingRefreshResponse(responseJson) {
    var candidate = responseJson && responseJson.candidates && responseJson.candidates[0];
    var metadata = candidate && candidate.groundingMetadata ? candidate.groundingMetadata : {};
    var text = extractGeminiText(responseJson);
    var parsed = {};
    var sources = [];
    var seen = {};

    try {
      parsed = JSON.parse(stripJsonFence(text));
    } catch (error) {
      parsed = { platforms: [], error: "Could not parse Gemini JSON: " + error.message };
    }

    (metadata.groundingChunks || []).forEach(function(chunk) {
      var web = chunk && chunk.web;
      if (!web || !web.uri || seen[web.uri]) return;
      seen[web.uri] = true;
      sources.push({
        label: web.title || web.uri,
        url: web.uri
      });
    });

    return {
      platforms: (parsed.platforms || []).map(normalizeStreamingPlatform),
      sources: sources,
      queries: metadata.webSearchQueries || [],
      searchHtml: metadata.searchEntryPoint && metadata.searchEntryPoint.renderedContent ? metadata.searchEntryPoint.renderedContent : "",
      rawText: text,
      error: parsed.error || ""
    };
  }

  function buildContextForTab(tabId) {
    var tab = getTab(tabId);
    if (!tab) return "General dashboard";
    if (tabId === "ai") {
      return "Current tab: AI Updates. Items: " + data.aiUpdates.map(function(item) {
        return item.lab + " - " + item.title + ": " + item.takeaway;
      }).join(" | ");
    }
    if (tabId === "health") {
      return "Current tab: Health & Fitness. Sections: " + data.health.sections.map(function(section) {
        return section.title + ": " + section.short;
      }).join(" | ");
    }
    if (tabId === "travel") {
      return "Current tab: Travel & Vlogs. Destinations: " + data.travel.destinations.map(function(place) {
        return place.place + " for " + place.bestFor;
      }).join(" | ");
    }
    if (tabId === "motivation") {
      var quote = data.motivation.quotes[quoteIndex] || data.motivation.quotes[0];
      return "Current tab: Motivation. Today's quote: " + quote.text;
    }
    if (tabId === "streaming") {
      return "Current tab: Movies & Series. Platforms: " + data.streaming.platforms.map(function(platform) {
        return platform.name + " trending: " + platform.items.slice(0, 4).map(function(item) {
          return item.title;
        }).join(", ");
      }).join(" | ");
    }
    if (tabId === "nano-banana") {
      return "Current tab: Nano Banana image studio. The user can generate images, upload reference images, and chat with Gemini image-preview models.";
    }
    return "Current tab: Gemini Chat. The user can ask about any dashboard section.";
  }

  function panelHeader(tab) {
    return [
      '<div class="panel-header">',
      '<div class="panel-copy">',
      '<p class="eyebrow">' + escapeHtml(tab.kicker) + '</p>',
      '<h2>' + escapeHtml(tab.title) + '</h2>',
      '<p>' + escapeHtml(tab.summary) + '</p>',
      '</div>',
      '<figure class="panel-visual">',
      '<img src="' + escapeAttr(tab.image) + '" alt="' + escapeAttr(tab.imageAlt) + '">',
      '</figure>',
      '</div>'
    ].join("");
  }

  function promptButtons(tabId) {
    var prompts = (data.promptChips && data.promptChips[tabId]) || [];
    return '<div class="prompt-grid">' + prompts.map(function(prompt) {
      return '<button type="button" class="prompt-chip" data-prompt="' + escapeAttr(prompt) + '">' + escapeHtml(prompt) + '</button>';
    }).join("") + "</div>";
  }

  function renderAiPanel() {
    var tab = getTab("ai");
    var cards = data.aiUpdates.map(function(item) {
      return [
        '<article class="info-card ai-card">',
        '<div class="card-topline">',
        '<span class="tag">' + escapeHtml(item.lab) + '</span>',
        '<span class="muted">' + escapeHtml(item.date) + '</span>',
        '</div>',
        '<h3>' + escapeHtml(item.title) + '</h3>',
        '<p>' + escapeHtml(item.takeaway) + '</p>',
        '<p class="why"><strong>Why it matters:</strong> ' + escapeHtml(item.why) + '</p>',
        sourceLinks([item.source]),
        '</article>'
      ].join("");
    }).join("");
    var queue = data.aiReadingQueue.map(function(link) {
      return sourceLink(link);
    }).join("");
    return panelHeader(tab) + promptButtons("ai") + '<div class="section-heading"><h3>Signals To Watch</h3><p>Primary sources first, Reddit sentiment second.</p></div><div class="card-grid">' + cards + '</div><div class="link-band"><h3>Reading Queue</h3><div class="source-row">' + queue + "</div></div>";
  }

  function renderGeminiPanel() {
    var tab = getTab("gemini");
    return [
      panelHeader(tab),
      promptButtons("gemini"),
      '<div class="two-column">',
      '<article class="info-card">',
      '<h3>Security stance</h3>',
      '<p>This is plain HTML, so Gemini requests are made from your browser. The key is not in the project files. Use a restricted key and clear it when done.</p>',
      sourceLinks([{ label: "Google API key guidance", url: "https://ai.google.dev/gemini-api/docs/api-key" }]),
      '</article>',
      '<article class="info-card">',
      '<h3>API path</h3>',
      '<p>The chat uses the Gemini REST generateContent endpoint with the selected model and your current tab as context.</p>',
      sourceLinks([{ label: "Gemini text generation docs", url: "https://ai.google.dev/gemini-api/docs/text-generation" }]),
      '</article>',
      '</div>'
    ].join("");
  }

  function renderHealthPanel() {
    var tab = getTab("health");
    var sections = data.health.sections.map(function(section) {
      return [
        '<article class="info-card">',
        '<span class="tag">' + escapeHtml(section.id) + '</span>',
        '<h3>' + escapeHtml(section.title) + '</h3>',
        '<p class="standout">' + escapeHtml(section.short) + '</p>',
        '<ul class="clean-list">',
        section.guidance.map(function(line) {
          return '<li>' + escapeHtml(line) + '</li>';
        }).join(""),
        '</ul>',
        sourceLinks(section.sources),
        '</article>'
      ].join("");
    }).join("");
    var plan = data.health.weeklyPlan.map(function(day) {
      return '<li><strong>' + escapeHtml(day.day) + '</strong><span>' + escapeHtml(day.focus) + '</span><small>' + escapeHtml(day.detail) + '</small></li>';
    }).join("");
    return panelHeader(tab) + promptButtons("health") + '<div class="card-grid">' + sections + '</div><div class="routine-strip"><h3>Simple Weekly Rhythm</h3><ol>' + plan + "</ol></div>";
  }

  function renderTravelPanel() {
    var tab = getTab("travel");
    var places = data.travel.destinations.map(function(place) {
      return [
        '<article class="info-card travel-card">',
        '<div class="card-topline"><span class="tag">' + escapeHtml(place.bestFor) + '</span></div>',
        '<h3>' + escapeHtml(place.place) + '</h3>',
        '<p>' + escapeHtml(place.why) + '</p>',
        '<p class="why"><strong>Vlog angle:</strong> ' + escapeHtml(place.vlogAngle) + '</p>',
        sourceLinks(place.sources),
        '</article>'
      ].join("");
    }).join("");
    return panelHeader(tab) + promptButtons("travel") + '<div class="card-grid">' + places + "</div>";
  }

  function quoteCard() {
    var quote = data.motivation.quotes[quoteIndex];
    return [
      '<article class="quote-card">',
      '<span class="tag">' + escapeHtml(quote.theme) + '</span>',
      '<blockquote>' + escapeHtml(quote.text) + '</blockquote>',
      '<div class="quote-actions">',
      '<button type="button" id="prev-quote">Previous</button>',
      '<button type="button" id="daily-quote">Today</button>',
      '<button type="button" id="next-quote">Next</button>',
      '</div>',
      '</article>'
    ].join("");
  }

  function renderMotivationPanel() {
    var tab = getTab("motivation");
    var actions = data.motivation.actions.map(function(action) {
      return '<li>' + escapeHtml(action) + '</li>';
    }).join("");
    var quotes = data.motivation.quotes.map(function(quote, index) {
      return '<button type="button" class="quote-mini" data-quote-index="' + index + '">' + escapeHtml(quote.text) + '</button>';
    }).join("");
    return panelHeader(tab) + promptButtons("motivation") + '<div id="quote-stage">' + quoteCard() + '</div><div class="two-column"><article class="info-card"><h3>Today Actions</h3><ul class="clean-list">' + actions + '</ul></article><article class="info-card"><h3>Quote Bank</h3><div class="quote-bank">' + quotes + "</div></article></div>";
  }

  function nanoModelOptions() {
    return data.nanoBanana.models.map(function(model) {
      return '<option value="' + escapeAttr(model.id) + '">' + escapeHtml(model.label) + '</option>';
    }).join("");
  }

  function selectedNanoModelDescription() {
    var select = typeof document !== "undefined" ? document.getElementById("nano-model") : null;
    var selected = select ? select.value : data.nanoBanana.defaultModel;
    var model = data.nanoBanana.models.find(function(item) {
      return item.id === selected;
    }) || data.nanoBanana.models[0];
    return model ? model.description : "";
  }

  function renderNanoBananaPanel() {
    var tab = getTab("nano-banana");
    var features = data.nanoBanana.features.map(function(feature) {
      return [
        '<article class="feature-card nano-feature">',
        '<h3>' + escapeHtml(feature.title) + '</h3>',
        '<p>' + escapeHtml(feature.description) + '</p>',
        '</article>'
      ].join("");
    }).join("");

    return [
      panelHeader(tab),
      promptButtons("nano-banana"),
      '<section class="nano-workbench" aria-label="Nano Banana image generation workspace">',
      '<div class="nano-config-grid">',
      '<article class="info-card nano-config-card">',
      '<label for="nano-model">Nano Banana model</label>',
      '<select id="nano-model">' + nanoModelOptions() + '</select>',
      '<p class="model-info" id="nano-model-info">' + escapeHtml(data.nanoBanana.models[0].description) + '</p>',
      '</article>',
      '<article class="info-card nano-config-card">',
      '<h3>Recovered project</h3>',
      '<p>This tab preserves your previous Gemini image generation website instead of replacing it with the dashboard.</p>',
      '</article>',
      '</div>',
      '<div class="nano-chat-container" id="nano-chat-container" aria-live="polite"></div>',
      '<div class="nano-input-section">',
      '<div class="nano-input-wrapper">',
      '<label for="nano-user-input">Prompt</label>',
      '<textarea id="nano-user-input" rows="3" placeholder="Describe the image, edit, or analysis you want. Drop or paste images here."></textarea>',
      '<div class="nano-image-preview-container" id="nano-image-preview-container"></div>',
      '</div>',
      '<div class="nano-input-buttons">',
      '<label class="nano-upload-btn" for="nano-image-upload" title="Attach images">',
      '<span aria-hidden="true">+</span>',
      '<input type="file" id="nano-image-upload" multiple accept="image/*" hidden>',
      '</label>',
      '<button type="button" id="nano-send-btn" class="primary-button">Send</button>',
      '</div>',
      '</div>',
      '<button type="button" id="nano-clear-chat" class="clear-btn">Clear Chat</button>',
      '<div class="features nano-features">' + features + '</div>',
      '</section>'
    ].join("");
  }

  function renderStreamingPanel() {
    var tab = getTab("streaming");
    function renderPlatforms(platformList, live) {
      return platformList.map(function(platform) {
      var rows = platform.items.map(function(item) {
        var confidence = item.confidence ? '<em class="confidence">' + escapeHtml(item.confidence) + '</em>' : "";
        return [
          '<article class="poster-card">',
          '<figure class="poster-image">',
          '<img src="' + escapeAttr(posterImage(item, platform)) + '" alt="' + escapeAttr(item.title + " visual card") + '" loading="lazy">',
          '<span class="rank rank-badge">' + item.rank + '</span>',
          renderRatingBadges(item),
          '</figure>',
          '<div class="poster-meta">',
          '<strong>' + escapeHtml(item.title) + '</strong>',
          '<small>' + escapeHtml(item.type) + ' - ' + escapeHtml(item.signal) + '</small>',
          confidence,
          '<div class="poster-actions">',
          '<button type="button" class="icon-button play-button" data-prompt="' + escapeAttr("Tell me why " + item.title + " is trending on " + platform.name + " and whether I should watch it.") + '" aria-label="Ask Gemini about ' + escapeAttr(item.title) + '">' + icon("play") + '<span>Ask</span></button>',
          '<button type="button" class="icon-button" data-prompt="' + escapeAttr("Add " + item.title + " from " + platform.name + " to a weekend watchlist and pair it with similar shows.") + '" aria-label="Add ' + escapeAttr(item.title) + ' to watchlist prompt">' + icon("plus") + '</button>',
          '<button type="button" class="icon-button" data-prompt="' + escapeAttr("Give me spoiler-free details, ratings context, and source confidence for " + item.title + ".") + '" aria-label="Get info about ' + escapeAttr(item.title) + '">' + icon("info") + '</button>',
          '</div>',
          '</div>',
          '</article>'
        ].join("");
      }).join("");
      return [
        '<article class="platform-row visual-platform ' + escapeAttr(platform.brandClass || "brand-generic") + '">',
        '<div class="platform-backdrop"><img src="' + escapeAttr(platform.heroImage) + '" alt="' + escapeAttr(platform.heroAlt || platform.name + " backdrop") + '" loading="lazy"></div>',
        '<div class="platform-content">',
        '<div class="platform-heading">',
        '<div class="brand-lockup"><span class="brand-logo">' + escapeHtml(platform.logoText || platform.name) + '</span><span class="tag">' + escapeHtml(platform.name) + '</span></div>',
        '<p>' + escapeHtml(platform.sourceNote) + '</p>',
        '</div>',
        '<div class="poster-rail">' + rows + '</div>',
        live ? "" : sourceLinks(platform.sources),
        '</div>',
        '</article>'
      ].join("");
      }).join("");
    }
    var refreshConfig = data.streaming.liveRefresh;
    var statusText = streamingRefresh.status === "loading" ? "Refreshing with Gemini Search..." : streamingRefresh.status === "ok" ? "Live refresh completed " + streamingRefresh.updatedAt : streamingRefresh.status === "error" ? streamingRefresh.error : "Static snapshot is visible below.";
    var liveBlock = "";
    if (streamingRefresh.platforms && streamingRefresh.platforms.length) {
      liveBlock = [
        '<div class="section-heading live-heading"><h3>Live Refreshed Results</h3><p>' + escapeHtml(streamingRefresh.updatedAt) + '</p></div>',
        '<div class="platforms live-platforms">' + renderPlatforms(streamingRefresh.platforms, true) + '</div>',
        streamingRefresh.sources.length ? '<div class="link-band"><h3>Gemini Search Citations</h3>' + sourceLinks(streamingRefresh.sources) + '</div>' : "",
        streamingRefresh.queries.length ? '<div class="query-row"><strong>Search queries:</strong> ' + streamingRefresh.queries.map(function(query) { return '<span>' + escapeHtml(query) + '</span>'; }).join("") + '</div>' : "",
        streamingRefresh.searchHtml ? '<div class="search-entry">' + streamingRefresh.searchHtml + '</div>' : ""
      ].join("");
    } else if (streamingRefresh.rawText) {
      liveBlock = '<article class="info-card"><h3>Gemini Refresh Output</h3><p>' + markdownLite(streamingRefresh.rawText) + '</p></article>';
    }
    return [
      panelHeader(tab),
      promptButtons("streaming"),
      '<section class="streaming-showcase">',
      '<section class="refresh-panel" aria-label="Streaming refresh controls">',
      '<div><h3>' + icon("refresh") + escapeHtml(refreshConfig.title) + '</h3><p>' + escapeHtml(refreshConfig.explainer) + '</p></div>',
      '<button type="button" id="refresh-streaming" class="primary-button icon-button refresh-cta">' + icon("refresh") + '<span>Refresh with Gemini Search</span></button>',
      '<p class="refresh-status" id="streaming-refresh-status" data-state="' + escapeAttr(streamingRefresh.status) + '">' + escapeHtml(statusText) + '</p>',
      '<details><summary>Official-source priority</summary><ul>' + refreshConfig.sourcePriority.map(function(item) { return '<li>' + escapeHtml(item) + '</li>'; }).join("") + '</ul></details>',
      '</section>',
      liveBlock,
      '<div class="section-heading"><h3>Static Backup Snapshot</h3><p>' + escapeHtml(data.streaming.snapshot) + '</p></div>',
      '<div class="platforms">' + renderPlatforms(data.streaming.platforms, false) + '</div>',
      '</section>'
    ].join("");
  }

  function renderPanels() {
    var renderers = {
      ai: renderAiPanel,
      gemini: renderGeminiPanel,
      health: renderHealthPanel,
      travel: renderTravelPanel,
      motivation: renderMotivationPanel,
      streaming: renderStreamingPanel,
      "nano-banana": renderNanoBananaPanel
    };
    Object.keys(renderers).forEach(function(tabId) {
      var panel = document.querySelector('[data-panel="' + tabId + '"]');
      if (panel) panel.innerHTML = renderers[tabId]();
    });
  }

  function setActiveTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll("[role=\"tab\"]").forEach(function(button) {
      var isActive = button.dataset.tab === tabId;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });
    document.querySelectorAll("[role=\"tabpanel\"]").forEach(function(panel) {
      var isActive = panel.dataset.panel === tabId;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });
    var context = document.getElementById("active-context");
    if (context) context.textContent = getTab(tabId).label;
  }

  function setupTabs() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[role=\"tab\"]"));
    buttons.forEach(function(button, index) {
      button.addEventListener("click", function() {
        setActiveTab(button.dataset.tab);
      });
      button.addEventListener("keydown", function(event) {
        var nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
        if (nextIndex !== index) {
          event.preventDefault();
          buttons[nextIndex].focus();
          setActiveTab(buttons[nextIndex].dataset.tab);
        }
      });
    });
  }

  function setupModels() {
    var select = document.getElementById("model-select");
    if (!select) return;
    select.innerHTML = data.gemini.models.map(function(model) {
      return '<option value="' + escapeAttr(model.id) + '">' + escapeHtml(model.label) + '</option>';
    }).join("");
    select.value = data.gemini.defaultModel;
  }

  function getStoredKey() {
    try {
      return root.localStorage ? root.localStorage.getItem("personalDashboardGeminiKey") || "" : "";
    } catch (error) {
      return "";
    }
  }

  function storeKey(value, remember) {
    try {
      if (!root.localStorage) return;
      if (remember && value) {
        root.localStorage.setItem("personalDashboardGeminiKey", value);
      } else {
        root.localStorage.removeItem("personalDashboardGeminiKey");
      }
    } catch (error) {
      return;
    }
  }

  function addMessage(role, text) {
    chatHistory.push({ role: role, text: text });
    renderChat();
  }

  function renderChat() {
    var box = document.getElementById("chat-messages");
    if (!box) return;
    if (!chatHistory.length) {
      box.innerHTML = '<div class="empty-chat"><strong>Ready when your key is in.</strong><span>Use a prompt chip or ask from scratch.</span></div>';
      return;
    }
    box.innerHTML = chatHistory.map(function(message) {
      return '<div class="chat-message ' + (message.role === "model" ? "model" : "user") + '"><p>' + markdownLite(message.text) + '</p></div>';
    }).join("");
    box.scrollTop = box.scrollHeight;
  }

  function setStatus(text, tone) {
    var status = document.getElementById("chat-status");
    if (!status) return;
    status.textContent = text || "";
    status.dataset.tone = tone || "";
  }

  function readApiKey() {
    var input = document.getElementById("api-key");
    return input ? input.value.trim() : "";
  }

  function readModel() {
    var select = document.getElementById("model-select");
    return select ? select.value : data.gemini.defaultModel;
  }

  function handleKeyPersistence() {
    var input = document.getElementById("api-key");
    var remember = document.getElementById("remember-key");
    var stored = getStoredKey();
    if (stored && input && remember) {
      input.value = stored;
      remember.checked = true;
    }
    [input, remember].forEach(function(element) {
      if (!element) return;
      element.addEventListener("change", function() {
        storeKey(readApiKey(), remember && remember.checked);
      });
    });
    if (input) {
      input.addEventListener("input", function() {
        storeKey(readApiKey(), remember && remember.checked);
      });
    }
    var clear = document.getElementById("clear-key");
    if (clear) {
      clear.addEventListener("click", function() {
        if (input) input.value = "";
        if (remember) remember.checked = false;
        storeKey("", false);
        setStatus("Key cleared from this browser.", "ok");
      });
    }
  }

  function submitPrompt(promptText) {
    var apiKey = readApiKey();
    var text = (promptText || document.getElementById("chat-input").value || "").trim();
    if (!text) {
      setStatus("Write a question first.", "error");
      return Promise.resolve();
    }
    if (!apiKey) {
      setStatus("Paste your Gemini API key before sending.", "error");
      addMessage("model", "Paste your Gemini API key in the top-right panel first. I will not store it unless you check Remember locally.");
      return Promise.resolve();
    }

    var historyBefore = chatHistory.slice();
    addMessage("user", text);
    setStatus("Asking Gemini...", "loading");

    var request = buildGeminiRequest({
      apiKey: apiKey,
      model: readModel(),
      userText: text,
      history: historyBefore,
      context: buildContextForTab(currentTab)
    });

    return fetch(request.url, request.options)
      .then(function(response) {
        return response.json().catch(function() {
          return {};
        }).then(function(json) {
          if (!response.ok) {
            var message = json.error && json.error.message ? json.error.message : "Gemini request failed with HTTP " + response.status + ".";
            throw new Error(message);
          }
          return json;
        });
      })
      .then(function(json) {
        addMessage("model", extractGeminiText(json));
        setStatus("Gemini responded.", "ok");
        var input = document.getElementById("chat-input");
        if (input && !promptText) input.value = "";
      })
      .catch(function(error) {
        addMessage("model", "Gemini error: " + error.message);
        setStatus("Gemini request failed.", "error");
      });
  }

  function setupChat() {
    renderChat();
    var form = document.getElementById("chat-form");
    if (form) {
      form.addEventListener("submit", function(event) {
        event.preventDefault();
        submitPrompt();
      });
    }
    var reset = document.getElementById("reset-chat");
    if (reset) {
      reset.addEventListener("click", function() {
        chatHistory = [];
        renderChat();
        setStatus("Chat reset.", "ok");
      });
    }
    document.addEventListener("click", function(event) {
      var target = event.target.closest("[data-prompt]");
      if (!target) return;
      var input = document.getElementById("chat-input");
      if (input) {
        input.value = target.dataset.prompt;
        input.focus();
      }
      setStatus("Prompt loaded.", "ok");
    });
  }

  function fileToBase64(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() {
        resolve(String(reader.result).split(",")[1] || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderNanoBananaPreviews() {
    var container = document.getElementById("nano-image-preview-container");
    if (!container) return;
    container.innerHTML = nanoBananaImages.map(function(image) {
      return [
        '<div class="nano-image-preview-item" data-id="' + escapeAttr(image.id) + '">',
        '<img src="data:' + escapeAttr(image.mimeType) + ';base64,' + escapeAttr(image.base64) + '" alt="' + escapeAttr(image.name) + '">',
        '<button type="button" class="nano-remove-image" data-remove-nano-image="' + escapeAttr(image.id) + '" aria-label="Remove ' + escapeAttr(image.name) + '">x</button>',
        '</div>'
      ].join("");
    }).join("");
  }

  function renderNanoBananaChat() {
    var container = document.getElementById("nano-chat-container");
    if (!container) return;
    if (!nanoBananaHistory.length) {
      container.innerHTML = '<div class="nano-message assistant"><div class="message-header">Gemini - Ready</div><div class="message-content">Paste your Gemini API key above, choose a Nano Banana model, then generate or edit images here.</div></div>';
      return;
    }
    container.innerHTML = nanoBananaHistory.map(function(message) {
      return [
        '<div class="nano-message ' + escapeAttr(message.role) + '">',
        '<div class="message-header">' + escapeHtml(message.sender) + ' - ' + escapeHtml(message.time) + '</div>',
        '<div class="message-content">' + (message.html || markdownLite(message.text || "")) + '</div>',
        '</div>'
      ].join("");
    }).join("");
    container.scrollTop = container.scrollHeight;
  }

  function addNanoBananaMessage(role, text, html) {
    nanoBananaHistory.push({
      role: role,
      sender: role === "user" ? "You" : role === "error" ? "Error" : "Gemini",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: text || "",
      html: html || ""
    });
    renderNanoBananaChat();
  }

  function clearNanoBananaImages() {
    nanoBananaImages = [];
    renderNanoBananaPreviews();
  }

  function removeNanoBananaImage(id) {
    nanoBananaImages = nanoBananaImages.filter(function(image) {
      return String(image.id) !== String(id);
    });
    renderNanoBananaPreviews();
  }

  function processNanoImageFiles(files) {
    var imageFiles = Array.prototype.slice.call(files || []).filter(function(file) {
      return file && file.type && file.type.indexOf("image/") === 0;
    });
    return imageFiles.reduce(function(previous, file) {
      return previous.then(function() {
        if (file.size > 20 * 1024 * 1024) {
          addNanoBananaMessage("error", "File " + file.name + " is too large. Max size is 20MB.");
          return null;
        }
        return fileToBase64(file).then(function(base64) {
          nanoBananaImages.push({
            id: String(Date.now()) + "-" + Math.random().toString(16).slice(2),
            base64: base64,
            mimeType: file.type,
            name: file.name
          });
          renderNanoBananaPreviews();
          return null;
        });
      });
    }, Promise.resolve());
  }

  function nanoBananaContentsForHistory() {
    return nanoBananaHistory
      .filter(function(message) {
        return message.role === "user" || message.role === "assistant";
      })
      .slice(-8)
      .map(function(message) {
        return {
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.text || "" }]
        };
      });
  }

  function extractNanoBananaHtml(responseJson) {
    var parts = responseJson && responseJson.candidates && responseJson.candidates[0] && responseJson.candidates[0].content ? responseJson.candidates[0].content.parts || [] : [];
    var html = "";
    var textForHistory = "";
    parts.forEach(function(part) {
      if (part.text) {
        textForHistory += part.text;
        html += markdownLite(part.text);
      }
      if (part.inlineData) {
        html += '<img src="data:' + escapeAttr(part.inlineData.mimeType) + ';base64,' + escapeAttr(part.inlineData.data) + '" alt="Generated Nano Banana image">';
      }
    });
    if (!html) {
      html = "No response received after 3 attempts. Please try again.";
      textForHistory = html;
    }
    return {
      html: html,
      text: textForHistory || "Generated image response."
    };
  }

  function sendNanoBananaMessage() {
    var apiKey = readApiKey();
    var input = document.getElementById("nano-user-input");
    var model = document.getElementById("nano-model");
    var sendButton = document.getElementById("nano-send-btn");
    var userText = input ? input.value.trim() : "";
    var images = nanoBananaImages.slice();

    if (!apiKey) {
      addNanoBananaMessage("error", "Please paste your Gemini API key in the top-right panel first.");
      setStatus("Paste your Gemini API key before using Nano Banana.", "error");
      return Promise.resolve();
    }
    if (!userText && !images.length) return Promise.resolve();

    var imageHtml = images.map(function(image) {
      return '<img src="data:' + escapeAttr(image.mimeType) + ';base64,' + escapeAttr(image.base64) + '" alt="' + escapeAttr(image.name) + '">';
    }).join("");
    var displayHtml = (imageHtml ? '<div class="user-images">' + imageHtml + '</div>' : "") + (userText ? '<p>' + escapeHtml(userText) + '</p>' : "");
    addNanoBananaMessage("user", userText || "Image prompt", displayHtml);
    if (input) input.value = "";
    clearNanoBananaImages();
    if (sendButton) {
      sendButton.disabled = true;
      sendButton.textContent = "Working...";
    }

    var request = buildNanoBananaRequest({
      apiKey: apiKey,
      model: model ? model.value : data.nanoBanana.defaultModel,
      userText: userText,
      images: images,
      history: nanoBananaContentsForHistory()
    });

    var attempts = 0;
    function attemptFetch() {
      attempts += 1;
      return fetch(request.url, request.options)
        .then(function(response) {
          return response.json().catch(function() {
            return {};
          }).then(function(json) {
            if (!response.ok || json.error) {
              var message = json.error && json.error.message ? json.error.message : "Nano Banana request failed with HTTP " + response.status + ".";
              throw new Error(message);
            }
            var parts = json.candidates && json.candidates[0] && json.candidates[0].content ? json.candidates[0].content.parts || [] : [];
            if (!parts.some(function(part) { return part.text || part.inlineData; }) && attempts < 3) {
              if (sendButton) sendButton.textContent = "Retry " + attempts + "/3";
              return new Promise(function(resolve) {
                root.setTimeout(resolve, 1000 * attempts);
              }).then(attemptFetch);
            }
            return json;
          });
        });
    }

    return attemptFetch()
      .then(function(json) {
        var extracted = extractNanoBananaHtml(json);
        addNanoBananaMessage("assistant", extracted.text, extracted.html);
        setStatus("Nano Banana responded.", "ok");
      })
      .catch(function(error) {
        addNanoBananaMessage("error", "Nano Banana error: " + error.message);
        setStatus("Nano Banana request failed.", "error");
      })
      .finally(function() {
        if (sendButton) {
          sendButton.disabled = false;
          sendButton.textContent = "Send";
        }
      });
  }

  function clearNanoBananaChat() {
    nanoBananaHistory = [];
    clearNanoBananaImages();
    renderNanoBananaChat();
    setStatus("Nano Banana chat reset.", "ok");
  }

  function setupNanoBanana() {
    var model = document.getElementById("nano-model");
    var modelInfo = document.getElementById("nano-model-info");
    var input = document.getElementById("nano-user-input");
    var upload = document.getElementById("nano-image-upload");
    var send = document.getElementById("nano-send-btn");
    var clear = document.getElementById("nano-clear-chat");
    if (!input || !model) return;

    model.value = data.nanoBanana.defaultModel;
    if (modelInfo) modelInfo.textContent = selectedNanoModelDescription();
    model.addEventListener("change", function() {
      if (modelInfo) modelInfo.textContent = selectedNanoModelDescription();
    });

    if (upload) {
      upload.addEventListener("change", function(event) {
        processNanoImageFiles(event.target.files).then(function() {
          event.target.value = "";
        });
      });
    }

    input.addEventListener("dragover", function(event) {
      event.preventDefault();
      input.classList.add("is-drop-target");
    });
    input.addEventListener("dragleave", function(event) {
      event.preventDefault();
      input.classList.remove("is-drop-target");
    });
    input.addEventListener("drop", function(event) {
      event.preventDefault();
      input.classList.remove("is-drop-target");
      processNanoImageFiles(event.dataTransfer.files);
    });
    input.addEventListener("paste", function(event) {
      var items = Array.prototype.slice.call(event.clipboardData ? event.clipboardData.items : []);
      var files = items.filter(function(item) {
        return item.type && item.type.indexOf("image/") === 0;
      }).map(function(item) {
        return item.getAsFile();
      }).filter(Boolean);
      if (files.length) {
        event.preventDefault();
        processNanoImageFiles(files);
      }
    });
    input.addEventListener("keydown", function(event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendNanoBananaMessage();
      }
    });

    if (send) send.addEventListener("click", sendNanoBananaMessage);
    if (clear) clear.addEventListener("click", clearNanoBananaChat);

    document.addEventListener("click", function(event) {
      var remove = event.target.closest("[data-remove-nano-image]");
      if (remove) removeNanoBananaImage(remove.dataset.removeNanoImage);
    });

    renderNanoBananaChat();
    renderNanoBananaPreviews();
  }

  function updateStreamingPanel() {
    var panel = document.querySelector('[data-panel="streaming"]');
    if (panel) panel.innerHTML = renderStreamingPanel();
    setActiveTab(currentTab);
  }

  function setStreamingRefreshState(nextState) {
    Object.keys(nextState).forEach(function(key) {
      streamingRefresh[key] = nextState[key];
    });
    updateStreamingPanel();
  }

  function refreshStreamingTrends() {
    var apiKey = readApiKey();
    if (!apiKey) {
      setStreamingRefreshState({
        status: "error",
        error: "Paste your Gemini API key before refreshing live OTT trends."
      });
      setStatus("Paste your Gemini API key before refreshing streaming trends.", "error");
      return Promise.resolve();
    }

    setStreamingRefreshState({
      status: "loading",
      error: "",
      rawText: ""
    });

    var request = buildStreamingRefreshRequest({
      apiKey: apiKey,
      model: readModel()
    });

    return fetch(request.url, request.options)
      .then(function(response) {
        return response.json().catch(function() {
          return {};
        }).then(function(json) {
          if (!response.ok) {
            var message = json.error && json.error.message ? json.error.message : "Gemini refresh failed with HTTP " + response.status + ".";
            throw new Error(message);
          }
          return json;
        });
      })
      .then(function(json) {
        var parsed = parseStreamingRefreshResponse(json);
        setStreamingRefreshState({
          status: parsed.platforms.length ? "ok" : "error",
          updatedAt: new Date().toLocaleString(),
          platforms: parsed.platforms,
          sources: parsed.sources,
          queries: parsed.queries,
          searchHtml: parsed.searchHtml,
          rawText: parsed.rawText,
          error: parsed.platforms.length ? "" : (parsed.error || "Gemini did not return refreshed platform rows.")
        });
        setStatus(parsed.platforms.length ? "Streaming trends refreshed with Gemini Search." : "Streaming refresh returned no rows.", parsed.platforms.length ? "ok" : "error");
      })
      .catch(function(error) {
        setStreamingRefreshState({
          status: "error",
          error: error.message
        });
        setStatus("Streaming refresh failed.", "error");
      });
  }

  function refreshQuoteStage() {
    var stage = document.getElementById("quote-stage");
    if (stage) stage.innerHTML = quoteCard();
  }

  function setupQuotes() {
    document.addEventListener("click", function(event) {
      if (event.target.id === "refresh-streaming") {
        refreshStreamingTrends();
      }
      if (event.target.id === "next-quote") {
        quoteIndex = (quoteIndex + 1) % data.motivation.quotes.length;
        refreshQuoteStage();
      }
      if (event.target.id === "prev-quote") {
        quoteIndex = (quoteIndex - 1 + data.motivation.quotes.length) % data.motivation.quotes.length;
        refreshQuoteStage();
      }
      if (event.target.id === "daily-quote") {
        quoteIndex = getDailyQuoteIndex(new Date(), data.motivation.quotes.length);
        refreshQuoteStage();
      }
      var mini = event.target.closest("[data-quote-index]");
      if (mini) {
        quoteIndex = Number(mini.dataset.quoteIndex);
        refreshQuoteStage();
      }
    });
  }

  function init() {
    quoteIndex = getDailyQuoteIndex(new Date(), data.motivation.quotes.length);
    setupModels();
    renderPanels();
    setupTabs();
    setupChat();
    setupQuotes();
    setupNanoBanana();
    handleKeyPersistence();
    setActiveTab(currentTab);
  }

  root.AIHubApp = {
    buildGeminiRequest: buildGeminiRequest,
    buildNanoBananaRequest: buildNanoBananaRequest,
    buildStreamingRefreshRequest: buildStreamingRefreshRequest,
    parseStreamingRefreshResponse: parseStreamingRefreshResponse,
    extractGeminiText: extractGeminiText,
    getDailyQuoteIndex: getDailyQuoteIndex,
    buildContextForTab: buildContextForTab
  };

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", init);
  }
})(typeof window !== "undefined" ? window : globalThis);
