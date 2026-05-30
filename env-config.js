// env-config.js
// ─────────────────────────────────────────────────────
// Netlify Environment Variable Injection
//
// HOW TO USE:
// 1. Go to Netlify → Site Settings → Environment Variables
// 2. Add:  GROQ_API_KEY = gsk_xxxxxxxxxxxxxxxx
// 3. In netlify.toml add a build step OR use Netlify's
//    "Snippet Injection" to include this file.
//
// For LOCAL DEV (no Netlify):
//   Open browser console and run:
//   localStorage.setItem("groq_api_key", "gsk_your_key_here")
//   Then refresh the page.
//
// This file sets window.GROQ_API_KEY using Netlify's
// environment variable substitution at build time.
// ─────────────────────────────────────────────────────

// Netlify replaces GROQ_API_KEY at build time if you add this
// file to your build output with a process.env substitution plugin.
// Simplest approach: use localStorage fallback in app.js (already done).

window.GROQ_API_KEY = window.GROQ_API_KEY || "";
