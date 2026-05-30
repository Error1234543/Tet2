# TET-2 ગુજરાતી અભ્યાસ — Setup Guide

## Files
```
tet2-app/
├── index.html      ← Main page
├── style.css       ← All styles
├── app.js          ← Core: topics, tabs, API calls, markdown
├── notes.js        ← Deep notes generation
├── quiz.js         ← MCQ generation + rendering (batch fix)
├── env-config.js   ← Env variable helper
└── netlify.toml    ← Netlify config
```

## Groq API Key Setup

### Option A — Local Dev (simplest)
1. Open the site in browser
2. Open DevTools Console (F12)
3. Run: `localStorage.setItem("groq_api_key", "gsk_your_key_here")`
4. Refresh page ✅

### Option B — Netlify Deployment
1. Push this folder to GitHub
2. Connect to Netlify → New Site from Git
3. Go to: **Site Settings → Environment Variables**
4. Add variable: `GROQ_API_KEY` = `gsk_xxxxxxxx`
5. Redeploy ✅

## Get FREE Groq API Key
1. Go to https://console.groq.com
2. Sign up (free)
3. API Keys → Create Key
4. Copy the `gsk_...` key

## MCQ JSON Fix
- Quiz now generates in **batches of 5** — no more truncation errors
- Robust JSON parser with 3 fallback strategies
- Each batch uses max_tokens=2048 (always complete)

## Notes Improvement
- System prompt enforces 1200+ words
- 8 structured sections including Memory Tips & Practice Questions
- Deep explanation with Gujarat-specific examples
