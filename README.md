# AI Spend ROI Engine

Prototype dashboard exploring how an AI-spend visibility product (like Ramp)
could move from "where did the money go" to "what did the money accomplish."

## What's already live

A real Supabase project (`vcwtiprmlwktppnhckxr`) is provisioned and seeded —
credentials are already in `.env.local`. This is NOT a template you need to
set up from scratch:

- Full schema, RLS policies, and indexes applied
- Rollup views + RPC functions (`calculate_ases`, `get_vendor_anomalies`,
  `get_opportunities`) tested and working
- 6 months of seeded transaction data (Feb–Jul 2026) with one planted
  anomaly: Marketing's Anthropic spend +179.6% month-over-month in July,
  dragging their efficiency score to 47 while every other team sits 67–71.
  This is your demo centerpiece.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. You need your own `GROQ_API_KEY` in
`.env.local` for the `/ask` page to work — get one at
https://console.groq.com/keys. Everything else works without any additional
setup.

## What's built

- `/` — Executive Overview (KPI cards, spend-by-team, efficiency ring)
- `/teams` and `/teams/[id]` — drill-down with anomaly badges, top providers
- `/opportunities` — ranked savings opportunities with a static "Simulate
  change" modal (deliberately not real simulation logic — see the roadmap's
  cut list)
- `/ask` — Groq-hosted agent (`llama-3.3-70b-versatile`) with tool-calling
  against live Supabase data, non-streaming, cites transaction IDs

## Still open (Day 1 hour 8.5+ onward in the roadmap)

- Streaming upgrade for `/ask` (only if ahead of schedule)
- Polish pass: loading skeletons, empty states, mobile responsiveness
- Deploy to Vercel + push to GitHub (needs your credentials, not run from here)
- Rehearse the 5–6 agent questions until answers are consistently grounded
- Record the 90-second Loom

## Known simplifications (say these upfront in outreach, don't let someone else find them)

- ASES formula weights are illustrative, not empirically derived
- Anomaly detection is a single rule-based threshold, not a model
- `duplicate_tooling` fires for every team since the seed data gives every
  team both OpenAI and Anthropic by design — real data would be sparser
