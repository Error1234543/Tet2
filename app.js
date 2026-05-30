// ══════════════════════════════════════════════
// app.js  —  Core: Topics, Tabs, API, Markdown
// ══════════════════════════════════════════════

const App = (() => {

  // ── Read API key from env (set via Netlify env vars)
  // Fallback: localStorage for local dev
  const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
  const GROQ_MODEL    = "llama-3.3-70b-versatile";

  let apiKey = "";

  // Netlify env vars are injected at build time via a _redirects or netlify.toml
  // For pure static hosting, we read from window.ENV_GROQ_KEY if you inject it,
  // or fall back to localStorage.
  function loadApiKey() {
    if (window.GROQ_API_KEY) {
      apiKey = window.GROQ_API_KEY; // injected by Netlify env substitution
    } else {
      apiKey = localStorage.getItem("groq_api_key") || "";
    }
  }

  const TOPICS = [
    { emoji: "🧠", name: "બાળ વિકાસ અને મનોવિજ્ઞાન" },
    { emoji: "📖", name: "શિક્ષણ શાસ્ત્ર (Pedagogy)" },
    { emoji: "🔢", name: "ગણિત — સંખ્યા, બીજગણિત, જ્યોમેટ્રી" },
    { emoji: "📐", name: "ત્રિકોણમિતિ અને સ્ટેટિસ્ટિક્સ" },
    { emoji: "⚗️", name: "ભૌતિક અને રસાયણ વિજ્ઞાન" },
    { emoji: "🌿", name: "જીવ વિજ્ઞાન અને પર્યાવરણ" },
    { emoji: "📝", name: "ગુજરાતી વ્યાકરણ અને સાહિત્ય" },
    { emoji: "🇬🇧", name: "English Grammar & Literature" },
    { emoji: "🕌", name: "ભારતનો ઇતિહાસ" },
    { emoji: "🗺️", name: "ભૂગોળ (Geography)" },
    { emoji: "⚖️", name: "નાગરિકશાસ્ત્ર અને અર્થશાસ્ત્ર" },
    { emoji: "📰", name: "સામાન્ય જ્ઞાન અને કરંટ અફેર્સ" },
    { emoji: "🏫", name: "શિક્ષણ અધિકાર — RTE Act" },
    { emoji: "🧮", name: "સામાજિક ગણિત (Ratio, %, Interest)" },
    { emoji: "🌐", name: "વિશ્વ ભૂગોળ અને ઇતિહાસ" },
    { emoji: "🌱", name: "પ્રાથમિક પર્યાવરણ (EVS)" },
  ];

  let selectedNotesTopic = "";
  let selectedQuizTopic  = "";

  function renderTopics(gridId, type) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = TOPICS.map((t, i) => `
      <div class="topic-card" id="${type}-topic-${i}" onclick="App.selectTopic('${type}',${i})">
        <span class="topic-emoji">${t.emoji}</span>
        <div class="topic-name">${t.name}</div>
      </div>`).join("");
  }

  function selectTopic(type, idx) {
    document.querySelectorAll(`#${type}TopicsGrid .topic-card`)
      .forEach(c => c.classList.remove("selected"));
    document.getElementById(`${type}-topic-${idx}`).classList.add("selected");
    if (type === "notes") {
      selectedNotesTopic = TOPICS[idx].name;
      document.getElementById("customNotesTopic").value = "";
    } else {
      selectedQuizTopic = TOPICS[idx].name;
      document.getElementById("customQuizTopic").value = "";
    }
  }

  function switchTab(tab) {
    ["notes","quiz"].forEach(t => {
      document.getElementById(t + "Panel").classList.toggle("active", t === tab);
      document.getElementById(t + "TabBtn").classList.toggle("active", t === tab);
    });
  }

  // ── Groq API call with retry on truncation
  async function callGroq(systemPrompt, userPrompt, maxTokens = 4096) {
    loadApiKey();
    if (!apiKey) {
      throw new Error("API Key મળ્યો નહીં. localStorage માં 'groq_api_key' set કરો અથવા Netlify ENV GROQ_API_KEY set કરો.");
    }
    const res = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: maxTokens,
        temperature: 0.65,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt   }
        ]
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return data.choices[0].message.content;
  }

  // ── Markdown → HTML
  function mdToHTML(md) {
    let h = md
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      // headings
      .replace(/^#### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^### (.+)$/gm,  "<h3>$1</h3>")
      .replace(/^## (.+)$/gm,   "<h2>$1</h2>")
      .replace(/^# (.+)$/gm,    "<h1>$1</h1>")
      // bold / italic
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g,     "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g,         "<em>$1</em>")
      // blockquote
      .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
      // horizontal rule
      .replace(/^---+$/gm, "<hr>")
      // unordered list items
      .replace(/^[\*\-] (.+)$/gm, "<li>$1</li>")
      // ordered list items
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

    // wrap consecutive <li> in <ul>
    h = h.replace(/(<li>[\s\S]*?<\/li>)(\n<li>[\s\S]*?<\/li>)*/g, m => `<ul>${m}</ul>`);

    // tables  |col|col|
    h = h.replace(/((?:^\|.+\|\n?)+)/gm, tableBlock => {
      const rows = tableBlock.trim().split("\n").filter(r => !/^\|[-:| ]+\|$/.test(r));
      if (rows.length === 0) return "";
      const header = rows[0];
      const body   = rows.slice(1);
      const cells  = row => row.split("|").filter((_,i,a) => i>0 && i<a.length-1).map(c => c.trim());
      const th     = cells(header).map(c => `<th>${c}</th>`).join("");
      const tbody  = body.map(r => `<tr>${cells(r).map(c=>`<td>${c}</td>`).join("")}</tr>`).join("");
      return `<table><thead><tr>${th}</tr></thead><tbody>${tbody}</tbody></table>`;
    });

    // paragraphs (double newline → <p> break)
    h = h.split(/\n{2,}/).map(chunk => {
      chunk = chunk.trim();
      if (!chunk) return "";
      if (/^<[hut]/.test(chunk) || /^<block/.test(chunk) || /^<hr/.test(chunk)) return chunk;
      return `<p>${chunk.replace(/\n/g," ")}</p>`;
    }).join("\n");

    return h;
  }

  function getSelectedNotesTopic() { return selectedNotesTopic; }
  function getSelectedQuizTopic()  { return selectedQuizTopic;  }

  function init() {
    loadApiKey();
    renderTopics("notesTopicsGrid", "notes");
    renderTopics("quizTopicsGrid",  "quiz");
  }

  // public API
  return { init, selectTopic, switchTab, callGroq, mdToHTML, getSelectedNotesTopic, getSelectedQuizTopic };

})();
