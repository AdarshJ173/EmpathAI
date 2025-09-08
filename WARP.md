# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- EmpathAI is a Next.js 15 (App Router) app in TypeScript under src/ with client voice input and AI chat.
- Key integrations:
  - Groq (server-side) for chat responses via /api/chat (defaults to llama-3.3-70b-versatile when GROQ_API_KEY is set)
  - Gemini is kept as a fallback if GROQ_API_KEY is not provided

Common commands
- Install dependencies
  - npm ci
- Development (PowerShell on Windows)
  - Set server-side env vars, then run dev:
    - $env:GEMINI_API_KEY={{GEMINI_API_KEY}}
    - npm run dev
- Development (bash on macOS/Linux)
  - GEMINI_API_KEY={{GEMINI_API_KEY}} npm run dev
- Build and run
  - npm run build
  - npm start
- Formatting (Prettier)
  - Check: npx prettier --check .
  - Write: npx prettier --write .
- Tests: None are configured in this repo at present.


API quick tests (with dev server running at http://localhost:3000)
- Chat (Groq preferred)
  - Windows PowerShell:
    - $env:GROQ_API_KEY={{GROQ_API_KEY}}
    - npm run dev
  - Then test:
    - curl -sS -X POST http://localhost:3000/api/chat \
      -H "Content-Type: application/json" \
      -d '{"messages":[{"role":"user","content":"Hello there!"}]}' | jq

High-level architecture
- Frontend (Next.js App Router)
  - src/app/layout.tsx: global layout, ThemeProvider, optional Tempo devtools (NEXT_PUBLIC_TEMPO)
  - src/app/page.tsx: main UI. Composes VoiceVisualizer (voice state/visuals) and ChatInterface (text/voice chat)
  - src/components/ui/*: shadcn/ui primitives; styling via Tailwind (see src/app/globals.css)
  - Path alias @/* resolves to src/* (see tsconfig.json)

- Client utilities
  - src/lib/ai-chat.ts
    - sendMessage wraps POST /api/chat with retry/timeout and typed ChatResponse
    - Formats user/assistant/system messages
  - src/lib/voice-recognition.ts
    - Browser speech recognition when available; graceful fallback mode when not
    - Real-time transcript callbacks and auto-submit on pause
    - Also exports a VoiceSynthesis wrapper with queueing and a fallback visual indicator
  - src/lib/nari-dia-tts.ts
    - Client-side controller for playing MP3 returned by /api/tts/dia
    - Queueing, priority speak, and playback lifecycle hooks

- Server/API routes (Next.js Route Handlers)
  - /api/chat (src/app/api/chat/route.ts)
    - Uses Groq (llama-3.3-70b-versatile by default via GROQ_API_KEY); falls back to Gemini if GROQ_API_KEY is not set
    - Adds resilient error handling and returns informative, UI-friendly fallbacks with status 200


Environment variables
- GEMINI_API_KEY: required by /api/chat (server-side)
- NEXT_PUBLIC_APP_NAME: optional, defaults to "EmpathAI"
- NEXT_PUBLIC_TEMPO: optional, enables Tempo devtools and experimental swc plugin in next.config.js

What’s notably absent
- No ESLint config or lint script are present; only Prettier is included.
- No unit test framework or test scripts are configured.

