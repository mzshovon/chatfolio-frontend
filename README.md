# Chatfolio — Public Chat UI

The public-facing frontend for a candidate's published Chatfolio page: profile info, optional
CV download, and a recruiter chat widget grounded in that candidate's data. Implements
[`Docs/PUBLIC_CHAT_UI_REFERENCE.md`](../Docs/PUBLIC_CHAT_UI_REFERENCE.md).

Built with Next.js (App Router) + TypeScript + Tailwind CSS v4. No authentication — every
endpoint here is called directly from the browser.

## Setup

```bash
cp .env.example .env.local   # point NEXT_PUBLIC_API_BASE_URL at your backend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page links to `/{slug}`, which
is where each candidate's page and chat widget live.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | yes | Base URL of the backend API, including the `/v1` prefix. Public because these endpoints are called straight from the browser — see `src/lib/env.ts`. |

## Structure

- `src/app/[slug]/` — a candidate's public page. Server-rendered: fetches the profile, follows a
  renamed slug via a real redirect, and renders Next's `not-found`/`error`/`loading` conventions
  for the unpublished/unavailable/loading states.
- `src/components/chat/` — the chat widget (header, message list, input, error banner).
- `src/components/portfolio/` — the slide-over portfolio panel and its sections.
- `src/hooks/useChatSession.ts` — owns the session lifecycle and maps every documented error case
  (404 session expired, 422 validation, 429 rate limit, 503 upstream failure) to UI state.
- `src/lib/api/` — typed fetch wrapper for the public endpoints.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build (also typechecks)
- `npm run lint` — ESLint
