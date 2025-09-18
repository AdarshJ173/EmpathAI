# EmpathAI – Emotion‑Aware Chat Backend

This backend adds a pre‑reply NLP stage that computes multi‑label emotion percentages using Transformers.js (GoEmotions ONNX) and injects them into the Groq chat call so the LLM can adapt tone. It keeps your current UI contract (/api/chat returns JSON) and remains compatible with the existing ChatInterface.

## What’s included
- Local, free emotion analysis via Transformers.js
  - Model: SamLowe/roberta-base-go_emotions-onnx
  - Multi‑label probabilities normalized to percentages
  - Singleton caching so the model loads once in dev
- Chat route upgrades (/api/chat)
  - Runs emotion analysis on the latest user message
  - Injects top and full emotion distribution into the system message
  - Calls Groq (OpenAI‑compatible endpoint) and returns JSON
  - Graceful 429 handling using Retry‑After header
- Env and dependencies
  - GROQ_API_KEY and GROQ_MODEL in .env.local
  - Dependencies: @huggingface/transformers, ai, @ai-sdk/groq

## Files
- src/lib/emotion.ts – Transformers.js pipeline (+ helpers)
- app/api/chat/route.ts – Emotion hook + Groq call + robust error handling
- .env.example – example keys for Groq + optional Gemini

## Setup
1) Install deps
   npm install

2) Configure environment
   - Copy .env.example to .env.local
   - Set GROQ_API_KEY=<your_key>
   - Optionally set GROQ_MODEL (default: llama-3.3-70b-versatile)

3) Run locally
   npm run dev

When you send a message, the server:
- Computes GoEmotions distribution locally
- Prepends an emotion summary to the system message
- Calls Groq and returns the AI reply plus analysis JSON for your UI

## Notes
- The classifier runs fully local and free. First run downloads the model weights.
- If Groq returns 429, a human‑friendly error is returned with retryAfter.
- The client remains unchanged — no streaming required. If you later move to streaming, the logic can be migrated easily to the Vercel AI SDK streamText helper.

