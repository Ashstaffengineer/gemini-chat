(function attachData(root) {
  root.APP_DATA = {
    meta: {
      generatedOn: "2026-06-06",
      timezone: "America/Los_Angeles",
      imageCredit: "Remote editorial photos from Unsplash are used as visual accents.",
      sourceNote: "Static research snapshot. Use the source links and Gemini prompts for fresh follow-up."
    },
    gemini: {
      defaultModel: "gemini-3.5-flash",
      models: [
        { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
        { id: "gemini-3.5-pro", label: "Gemini 3.5 Pro" },
        { id: "gemini-3-pro", label: "Gemini 3 Pro" },
        { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" }
      ]
    },
    tabs: [
      {
        id: "ai",
        label: "AI Updates",
        kicker: "Labs, models, coding agents",
        title: "Recent AI and vibe-coding signals",
        summary: "A dated scan of frontier model releases, coding-agent changes, and Reddit sentiment.",
        image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Developer workstation with code on screens"
      },
      {
        id: "gemini",
        label: "Gemini Chat",
        kicker: "Bring your own key",
        title: "Ask Gemini across the dashboard",
        summary: "Use your Gemini key to ask questions with the current tab as context.",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Server racks and technology lights"
      },
      {
        id: "health",
        label: "Health & Fitness",
        kicker: "Workout, hair, food",
        title: "A practical daily care plan",
        summary: "Evidence-backed fitness and nutrition, plus Indian male hair-care notes with scalp-first caution.",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Gym training floor with strength equipment"
      },
      {
        id: "travel",
        label: "Travel & Vlogs",
        kicker: "US places to explore",
        title: "Trips worth filming",
        summary: "Timely 2026 US travel ideas mixed with Reddit-style hidden-gem practicality.",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Wide outdoor landscape at golden hour"
      },
      {
        id: "motivation",
        label: "Motivation",
        kicker: "Daily fire",
        title: "Original quotes for hard days",
        summary: "Short, repeatable lines built for work harder, live fuller, and keep moving energy.",
        image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Sunrise over mountains"
      },
      {
        id: "streaming",
        label: "Movies & Series",
        kicker: "US streaming snapshot",
        title: "Trending by OTT platform",
        summary: "Rows for Netflix, Hulu, Apple TV, and HBO Max with dated US popularity signals.",
        image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Movie theater seats facing a screen"
      }
    ],
    aiUpdates: [
      {
        lab: "OpenAI",
        badge: "Model",
        title: "GPT-5.5 pushes agentic coding and long-horizon work",
        date: "May 2026",
        takeaway: "OpenAI positioned GPT-5.5 as a stronger Codex and ChatGPT model for engineering, tool use, debugging, validation, and professional computer work.",
        why: "The practical signal is that AI coding is moving from snippet generation toward delegated tasks with testing and review built into the workflow.",
        source: { label: "OpenAI GPT-5.5", url: "https://openai.com/index/introducing-gpt-5-5/" }
      },
      {
        lab: "OpenAI",
        badge: "Codex",
        title: "GPT-5.3-Codex marked a faster coding-agent baseline",
        date: "February 2026",
        takeaway: "OpenAI release notes describe GPT-5.3-Codex as a more capable agentic coding model and a shift from code generation to actively steerable coding work.",
        why: "Good vibe coding now means steering, inspecting, and validating the agent, not blindly accepting generated files.",
        source: { label: "OpenAI model release notes", url: "https://help.openai.com/en/articles/9624314-model-release-notes/" }
      },
      {
        lab: "Anthropic",
        badge: "Model",
        title: "Claude Opus 4.8 emphasizes reliable agent behavior",
        date: "May 28, 2026",
        takeaway: "Anthropic highlights better judgment, tool use, uncertainty handling, and Claude Code dynamic workflows that can plan and verify larger tasks.",
        why: "The trend is not just raw benchmark gains; the competitive edge is whether an AI assistant notices risk before shipping bad work.",
        source: { label: "Anthropic Claude Opus 4.8", url: "https://www.anthropic.com/news/claude-opus-4-8" }
      },
      {
        lab: "Google DeepMind",
        badge: "Gemini",
        title: "Gemini 3.5 Flash and Antigravity anchor Google I/O developer updates",
        date: "May 2026",
        takeaway: "Google announced Gemini 3.5 Flash in the Gemini API and Google AI Studio, tying faster models to Antigravity-powered agentic app building.",
        why: "For your Gemini key, the important direction is speed plus action: quick chats, app-building help, and multi-step coding workflows.",
        source: { label: "Google I/O developer highlights", url: "https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-developer-highlights/" }
      },
      {
        lab: "Google DeepMind",
        badge: "Vibe coding",
        title: "Google AI Studio leans into full-stack vibe coding",
        date: "March 2026",
        takeaway: "Google described an upgraded AI Studio experience meant to turn prompts into production-ready applications with Antigravity and Firebase integrations.",
        why: "This validates the category, but production-ready still depends on tests, security, and human review.",
        source: { label: "Google AI Studio vibe coding", url: "https://blog.google/innovation-and-ai/technology/developers-tools/full-stack-vibe-coding-google-ai-studio/" }
      },
      {
        lab: "GitHub",
        badge: "Agent tooling",
        title: "Copilot coding agent adds model picker, self-review, and security scanning",
        date: "February 2026",
        takeaway: "GitHub framed Copilot coding agent as background delegated engineering with PR handoff, custom agents, CLI handoff, and built-in review features.",
        why: "The workflow is converging on issue-to-PR agents plus human review, not just autocomplete.",
        source: { label: "GitHub Copilot coding agent", url: "https://github.blog/ai-and-ml/github-copilot/whats-new-with-github-copilot-coding-agent/" }
      },
      {
        lab: "Reddit",
        badge: "Community signal",
        title: "AI-literate communities are pushing back on low-effort vibe-coded posts",
        date: "April 2026",
        takeaway: "A highly upvoted LocalLLaMA thread complained that many showcased AI-coded projects do not fill real gaps and are easy for experienced users to spot.",
        why: "The bar is rising: demos need usefulness, maintainability, and transparent review to earn attention.",
        source: { label: "r/LocalLLaMA discussion", url: "https://www.reddit.com/r/LocalLLaMA/comments/1skt002/please_stop_using_ai_for_posts_and_showcasing/" }
      },
      {
        lab: "Reddit",
        badge: "Cost signal",
        title: "Vibe-coding users are questioning credit burn and code quality",
        date: "2026",
        takeaway: "Reddit threads around vibe coding describe frustration with expensive credits, bloated codebases, and agents that need strong supervision.",
        why: "The best personal workflow is agent-assisted building with tests, small scopes, and frequent verification.",
        source: { label: "r/vibecoding cost thread", url: "https://www.reddit.com/r/vibecoding/comments/1qb07qj/vibe_coding_is_very_expensive/" }
      },
      {
        lab: "Reddit",
        badge: "Culture",
        title: "Some programming spaces are filtering LLM discussion for signal",
        date: "April 2026",
        takeaway: "Coverage of r/programming's temporary LLM-content ban shows how saturated AI discussion became in mainstream developer communities.",
        why: "For daily reading, prioritize primary lab posts, independent benchmarks, and high-signal technical threads over hype loops.",
        source: { label: "Tom's Hardware coverage", url: "https://www.tomshardware.com/tech-industry/artificial-intelligence/the-largest-programming-community-on-reddit-just-banned-all-content-related-to-ai-llms-r-programming-is-prioritizing-only-high-quality-discussions-about-ai" }
      }
    ],
    aiReadingQueue: [
      { label: "OpenAI news", url: "https://openai.com/news/" },
      { label: "Anthropic news", url: "https://www.anthropic.com/news" },
      { label: "Google Gemini updates", url: "https://blog.google/products-and-platforms/products/gemini/" },
      { label: "r/LocalLLaMA", url: "https://www.reddit.com/r/LocalLLaMA/" },
      { label: "r/vibecoding", url: "https://www.reddit.com/r/vibecoding/" },
      { label: "GitHub AI blog", url: "https://github.blog/ai-and-ml/" }
    ],
    health: {
      sections: [
        {
          id: "workout",
          title: "How frequently should you work out?",
          short: "Aim for 4 to 5 active days per week once you have a base.",
          guidance: [
            "Minimum evidence-backed target: 150 minutes of moderate aerobic activity per week, or 75 minutes vigorous, plus muscle-strengthening on 2 days.",
            "Practical plan: 3 strength sessions, 2 cardio sessions, 1 mobility or long-walk day, and 1 full rest day.",
            "Start lower if you are detrained: 20 to 30 minutes, 3 days per week, then add time before intensity.",
            "Track sleep, soreness, appetite, and mood. If two or more are bad for several days, deload instead of forcing intensity."
          ],
          sources: [
            { label: "CDC adult activity", url: "https://www.cdc.gov/physical-activity-basics/guidelines/adults.html" },
            { label: "Physical Activity Guidelines", url: "https://www.cdc.gov/physical-activity/media/pdfs/Physical_Activity_Guidelines_2nd_edition.pdf" }
          ]
        },
        {
          id: "hair",
          title: "Hair care for an Indian man",
          short: "Treat the scalp first, then style the hair.",
          guidance: [
            "Wash your scalp regularly, especially after sweat, oil, styling products, or dust exposure. Frequency can be daily to every 3 days depending on oiliness.",
            "If dandruff or itch is present, avoid leaving heavy oil on the scalp. Oil mid-lengths and ends briefly before washing if you want softness.",
            "For flakes, rotate an anti-dandruff shampoo with ketoconazole, selenium sulfide, zinc pyrithione, or salicylic acid. Let medicated shampoo contact the scalp before rinsing as directed.",
            "Use conditioner on lengths, not a greasy scalp. Do not scrub aggressively; massage the scalp, rinse fully, and dry gently.",
            "For receding hairline or crown thinning, talk to a dermatologist early. Minoxidil and finasteride have evidence, but finasteride is prescription-only and needs risk discussion."
          ],
          sources: [
            { label: "CDC hair hygiene", url: "https://www.cdc.gov/hygiene/about/hair-and-scalp-hygiene.html" },
            { label: "AAD dandruff treatment", url: "https://www.aad.org/hair-scalp-care/treat-dandruff" },
            { label: "Mayo hair loss treatment", url: "https://www.mayoclinic.org/diseases-conditions/hair-loss/diagnosis-treatment/drc-20372932" },
            { label: "IndianHaircare Reddit signal", url: "https://www.reddit.com/r/IndianHaircare/comments/1pk4qug/dandruff_issue/" }
          ]
        },
        {
          id: "food",
          title: "What food should you eat daily?",
          short: "Build each day around protein, plants, fiber, water, and mostly unprocessed carbs.",
          guidance: [
            "Use the plate rule: half vegetables and fruit, one quarter whole grains, one quarter protein.",
            "Indian-friendly staples: dal, chana, rajma, tofu, paneer, eggs, fish, chicken, Greek yogurt, curd, oats, roti, brown rice, millets, nuts, and seeds.",
            "Daily basics: 25 to 40 grams fiber, 2 to 3 liters water adjusted for sweat, protein at each meal, and a fruit or vegetable snack before junk food.",
            "Limit sugary drinks, deep-fried snacks, heavy late-night meals, and ultra-processed foods. Keep party nights, but anchor them with protein and hydration."
          ],
          sources: [
            { label: "Harvard Healthy Eating Plate", url: "https://nutritionsource.hsph.harvard.edu/healthy-eating-plate/" },
            { label: "Healthy Eating Plate PDF", url: "https://nutritionsource.hsph.harvard.edu/wp-content/uploads/2012/10/healthy-eating-plate.pdf" }
          ]
        }
      ],
      weeklyPlan: [
        { day: "Monday", focus: "Upper strength", detail: "Push, pull, core, 45 to 60 minutes." },
        { day: "Tuesday", focus: "Cardio", detail: "Zone 2 walk, bike, or jog, 30 to 45 minutes." },
        { day: "Wednesday", focus: "Lower strength", detail: "Squat or hinge, lunges, calves, core." },
        { day: "Thursday", focus: "Mobility", detail: "Long walk, hips, shoulders, neck, light stretching." },
        { day: "Friday", focus: "Full body", detail: "Compound lifts plus accessories, moderate effort." },
        { day: "Saturday", focus: "Fun cardio", detail: "Hike, sport, dance, swim, or long city walk." },
        { day: "Sunday", focus: "Rest", detail: "Sleep, meal prep, and easy steps." }
      ]
    },
    travel: {
      destinations: [
        {
          place: "Boston, Massachusetts",
          bestFor: "History, food, city walks",
          why: "2026 is a timely year for US anniversary travel, and Boston keeps getting framed as more dynamic than its old college-town stereotype.",
          vlogAngle: "Film a 24-hour route from Freedom Trail history to modern neighborhoods and late-night food.",
          sources: [{ label: "Conde Nast Traveler US 2026", url: "https://www.cntraveler.com/story/best-places-to-go-in-the-us-in-2026" }]
        },
        {
          place: "Bentonville and Buffalo National River, Arkansas",
          bestFor: "Art plus outdoors",
          why: "Northwest Arkansas has museums, mountain biking, river scenery, and new hospitality attention.",
          vlogAngle: "Contrast a design-heavy museum day with a cliff, river, or trail day.",
          sources: [{ label: "Conde Nast Traveler US 2026", url: "https://www.cntraveler.com/story/best-places-to-go-in-the-us-in-2026" }]
        },
        {
          place: "Park City, Utah",
          bestFor: "Mountains, snow, summer trails",
          why: "A strong four-season pick if you want scenic footage without giving up restaurants and lodging.",
          vlogAngle: "Shoot the same main street morning-to-night, then cut to trail or slope footage.",
          sources: [{ label: "Conde Nast Traveler US 2026", url: "https://www.cntraveler.com/story/best-places-to-go-in-the-us-in-2026" }]
        },
        {
          place: "Sacramento, California",
          bestFor: "Food, rivers, underrated city energy",
          why: "Sacramento appeared on 2026 US travel coverage and works well as a lower-pressure California city trip.",
          vlogAngle: "Build a farm-to-fork, coffee, riverfront, and old-town episode.",
          sources: [{ label: "Sacramento Bee on CNT list", url: "https://www.sacbee.com/news/california/article315804706.html" }]
        },
        {
          place: "Theodore Roosevelt National Park, North Dakota",
          bestFor: "Badlands, wildlife, solitude",
          why: "Lonely Planet called out the park in its 2026 travel coverage, and it is less crowded than many western icons.",
          vlogAngle: "Film a quiet national-park diary around sunrise, bison, overlooks, and small-town stops.",
          sources: [{ label: "Lonely Planet 2026", url: "https://www.lonelyplanet.com/best-in-travel" }]
        },
        {
          place: "Black Hills, South Dakota",
          bestFor: "Road trip, rocks, forests",
          why: "Recent Reddit travel threads repeatedly surface the Black Hills as an underrated US region.",
          vlogAngle: "Make a no-rush loop: Custer State Park, Needles Highway, Badlands, and roadside diners.",
          sources: [{ label: "Reddit underrated US thread", url: "https://www.reddit.com/r/BeautifulTravelPlaces/comments/1t3unkh/what_is_the_most_underrated_tourist_destination/" }]
        },
        {
          place: "Santa Fe and Albuquerque, New Mexico",
          bestFor: "Art, chile, desert color",
          why: "Reddit travelers call out New Mexico for food, museums, turquoise markets, hikes, and balloon-season magic.",
          vlogAngle: "Create a color-and-food episode: adobe streets, chile, galleries, and sunset desert shots.",
          sources: [{ label: "Reddit solotravel thread", url: "https://www.reddit.com/r/solotravel/comments/12ugakw" }]
        },
        {
          place: "Virginia Beach and East Coast beaches",
          bestFor: "Summer, water, easy group trips",
          why: "Tripadvisor's 2026 summer travel coverage pointed to East Coast and Florida beach demand.",
          vlogAngle: "Film a realistic weekend: sunrise boardwalk, cheap eats, beach workout, and nightlife.",
          sources: [{ label: "Tripadvisor Summer Travel Index", url: "https://tripadvisor.mediaroom.com/2026-04-22-Tripadvisor-Summer-Travel-Index-Shows-East-Coast-and-Florida-Beaches-as-Americas-Most-Sought-After-Summer-Destinations" }]
        },
        {
          place: "Western national parks loop",
          bestFor: "Big scenery, first US parks trip",
          why: "Reddit national-park advice keeps warning that parks are far apart, so a focused loop beats an overstuffed itinerary.",
          vlogAngle: "Turn planning into content: distance, budget, permits, car camping, and what you skipped.",
          sources: [{ label: "Reddit national parks advice", url: "https://www.reddit.com/r/nationalparks/comments/1tv34ga/usa_travel_national_parks/" }]
        }
      ]
    },
    motivation: {
      quotes: [
        { text: "Do the hard thing before comfort starts negotiating.", theme: "Discipline" },
        { text: "You only live once, but you can live wide, deep, loud, and honest.", theme: "Life" },
        { text: "Work hard enough that your future self feels protected.", theme: "Work" },
        { text: "Party after progress. Celebration tastes better when it is earned.", theme: "Balance" },
        { text: "Choose the difficult rep today and tomorrow gets lighter.", theme: "Fitness" },
        { text: "The version of you waiting on the other side of fear is impatient.", theme: "Courage" },
        { text: "Build the body, build the bank, build the mind, then build the memories.", theme: "Life" },
        { text: "Do not wait for motivation. Start, and let motion become the mood.", theme: "Action" },
        { text: "Be intense with your goals and gentle with your recovery.", theme: "Recovery" },
        { text: "If life is short, stop living it like a draft.", theme: "Life" },
        { text: "A hard morning can become an easy year.", theme: "Discipline" },
        { text: "The work nobody sees becomes the confidence everybody feels.", theme: "Work" },
        { text: "Make your standards louder than your excuses.", theme: "Standards" },
        { text: "If you want a different story, give today a different ending.", theme: "Action" },
        { text: "You do not need perfect energy. You need one clean start.", theme: "Focus" },
        { text: "The best nights out follow days you are proud of.", theme: "Balance" },
        { text: "Train like your mood depends on it, because often it does.", theme: "Fitness" },
        { text: "Keep promises to yourself in private and life changes in public.", theme: "Integrity" },
        { text: "Hard choices compound. Easy choices also compound. Pick your interest rate.", theme: "Discipline" },
        { text: "Become the person your old excuses cannot recognize.", theme: "Growth" },
        { text: "Rest is part of the mission, not proof that you quit.", theme: "Recovery" },
        { text: "Live fully, but do not confuse chaos with courage.", theme: "Life" },
        { text: "The room changes when you walk in already proud of your day.", theme: "Confidence" },
        { text: "Do what is hard while it is optional, before life makes it mandatory.", theme: "Discipline" },
        { text: "Your future does not need a speech. It needs today's reps.", theme: "Action" }
      ],
      actions: [
        "Lift, walk, or stretch for 20 minutes.",
        "Send one message that opens a door.",
        "Read one primary source instead of ten hot takes.",
        "Cook one high-protein meal.",
        "Clean one area that has been stealing attention."
      ]
    },
    streaming: {
      snapshot: "US snapshot checked June 6, 2026",
      ratingFallback: {
        imdb: "TBA",
        rottenTomatoes: "TBA"
      },
      liveRefresh: {
        title: "Refresh with Gemini Search",
        explainer: "A local HTML page cannot directly scrape every official OTT platform because most streaming sites block cross-origin browser fetches and some do not publish a public official trending API. This refresh uses your Gemini key with Google Search grounding, prioritizes official platform-owned sources, and labels lower-confidence web signals clearly.",
        sourcePriority: [
          "Netflix official Top 10 pages and Netflix Tudum",
          "Hulu official pages or in-app top lists when discoverable",
          "Apple-owned Apple TV pages or Apple TV app/top chart coverage when discoverable",
          "HBO Max/Max official pages, press pages, or platform-owned release pages when discoverable"
        ]
      },
      platforms: [
        {
          name: "Netflix",
          logoText: "NETFLIX",
          brandClass: "brand-netflix",
          heroImage: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1400&q=80",
          heroAlt: "Cinema seats and dramatic streaming-style lighting",
          sourceNote: "Official weekly Top 10 plus daily audience buzz.",
          sources: [
            { label: "Netflix US Top 10", url: "https://www.netflix.com/tudum/top10/united-states" },
            { label: "TelevisionStats Netflix", url: "https://televisionstats.com/n/netflix" }
          ],
          items: [
            { rank: 1, title: "The Boroughs: Season 1", type: "Series", signal: "Official #1 show for 5/25 to 5/31" },
            { rank: 2, title: "The Crash", type: "Movie", signal: "Official #1 movie for 5/25 to 5/31" },
            { rank: 3, title: "Teach You a Lesson", type: "Series", signal: "Daily buzz leader on June 5" },
            { rank: 4, title: "The Four Seasons: Season 2", type: "Series", signal: "Top 3 official and high daily buzz" },
            { rank: 5, title: "Nemesis: Season 1", type: "Series", signal: "Official #2 show" },
            { rank: 6, title: "Ladies First", type: "Movie", signal: "Official top 5 film" }
          ]
        },
        {
          name: "Hulu",
          logoText: "hulu",
          brandClass: "brand-hulu",
          heroImage: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=1400&q=80",
          heroAlt: "Living room screen setup for streaming shows",
          sourceNote: "Daily audience buzz and June release chatter.",
          sources: [
            { label: "TelevisionStats Hulu", url: "https://televisionstats.com/n/hulu" },
            { label: "June streaming guide", url: "https://www.tomsguide.com/news/new-tv-shows" }
          ],
          items: [
            { rank: 1, title: "The Testaments", type: "Series", signal: "Daily Hulu buzz leader on June 5" },
            { rank: 2, title: "The Handmaid's Tale", type: "Series", signal: "Still high in Hulu engagement" },
            { rank: 3, title: "Paradise", type: "Series", signal: "Top daily Hulu buzz" },
            { rank: 4, title: "The Bear", type: "Series", signal: "High buzz with final season attention" },
            { rank: 5, title: "Shogun", type: "Series", signal: "Top 5 daily Hulu buzz" },
            { rank: 6, title: "Only Murders in the Building", type: "Series", signal: "Steady engagement title" }
          ]
        },
        {
          name: "Apple TV",
          logoText: "Apple TV",
          brandClass: "brand-apple",
          heroImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
          heroAlt: "Modern screen and premium streaming workspace",
          sourceNote: "Daily audience buzz plus current editor picks.",
          sources: [
            { label: "TelevisionStats Apple TV", url: "https://televisionstats.com/n/apple-tv" },
            { label: "TV Guide Apple TV picks", url: "https://www.tvguide.com/news/best-apple-tv-shows-movies/" },
            { label: "r/tvPlus discussion", url: "https://www.reddit.com/r/tvPlus/comments/1tvuud0/no_one_is_doing_it_quite_like_apple_tv_right_now/" }
          ],
          items: [
            { rank: 1, title: "Cape Fear", type: "Series", signal: "Daily Apple TV buzz leader on June 5" },
            { rank: 2, title: "Widow's Bay", type: "Series", signal: "High buzz and Reddit praise" },
            { rank: 3, title: "Ted Lasso", type: "Series", signal: "Evergreen top 3 daily buzz" },
            { rank: 4, title: "Your Friends & Neighbors", type: "Series", signal: "High daily buzz" },
            { rank: 5, title: "For All Mankind", type: "Series", signal: "Strong sci-fi engagement" },
            { rank: 6, title: "Margo's Got Money Troubles", type: "Series", signal: "Rising under-watched pick" }
          ]
        },
        {
          name: "HBO Max",
          logoText: "HBO Max",
          brandClass: "brand-max",
          heroImage: "https://images.unsplash.com/photo-1512070679279-8988d32161be?auto=format&fit=crop&w=1400&q=80",
          heroAlt: "Dark theater screen with premium cinematic atmosphere",
          sourceNote: "Daily HBO Max buzz, Rotten Tomatoes popularity, and June arrivals.",
          sources: [
            { label: "TelevisionStats HBO Max", url: "https://televisionstats.com/n/hbo-max" },
            { label: "Rotten Tomatoes HBO Max", url: "https://www.rottentomatoes.com/browse/tv_series_browse/affiliates%3Amax~sort%3Apopular" },
            { label: "Tom's Guide HBO Max June", url: "https://www.tomsguide.com/entertainment/hbo-max/new-on-hbo-max-in-june-2026-all-the-new-shows-and-movies-to-watch-this-month" }
          ],
          items: [
            { rank: 1, title: "Hacks", type: "Series", signal: "Daily HBO Max buzz leader" },
            { rank: 2, title: "The Pitt", type: "Series", signal: "Rotten Tomatoes popular HBO Max title" },
            { rank: 3, title: "Rooster", type: "Series", signal: "Rotten Tomatoes popular list" },
            { rank: 4, title: "House of the Dragon", type: "Series", signal: "Popular list plus June season attention" },
            { rank: 5, title: "Rick and Morty", type: "Series", signal: "June 15 season arrival" },
            { rank: 6, title: "Pillion", type: "Movie", signal: "June A24 arrival on HBO Max" }
          ]
        }
      ]
    },
    promptChips: {
      ai: [
        "Give me a ranked reading list for today's AI and coding-agent news.",
        "Summarize the Reddit vibe-coding backlash and what I should learn from it.",
        "Compare OpenAI Codex, Claude Code, Gemini Antigravity, and GitHub Copilot agent."
      ],
      gemini: [
        "Build me a weekly plan using this dashboard.",
        "Ask me five questions and personalize my AI, fitness, travel, and movie feed.",
        "Turn this site into a daily morning briefing."
      ],
      health: [
        "Create a 4-week workout plan for a beginner Indian man.",
        "Make a simple Indian meal plan with high protein and realistic groceries.",
        "Help me diagnose whether my hair routine is scalp-dandruff friendly."
      ],
      travel: [
        "Pick a 3-day US trip for me based on budget, weather, and filming potential.",
        "Make a vlog itinerary for New Mexico, Boston, or the Black Hills.",
        "Compare national park trips that are practical without overdriving."
      ],
      motivation: [
        "Give me a hard but healthy morning pep talk.",
        "Turn today's quote into a 5-step action plan.",
        "Write a short quote in the style of disciplined but fun YOLO energy."
      ],
      streaming: [
        "Build my weekend watchlist from Netflix, Hulu, Apple TV, and HBO Max.",
        "Pick one show per platform based on mood: intense, funny, smart, comfort.",
        "Explain what is trending and what I can skip."
      ]
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
