# AI Spend ROI Engine

**A CFO dashboard that answers "what did our AI spend accomplish?" instead of just "where did it go?"**

Most spend-visibility tools stop at reporting the number. This prototype layers an efficiency score, anomaly detection, and a grounded natural-language agent on top of raw transaction data — exploring what a product like Ramp could look like if it moved from AI-spend *visibility* to AI-spend *efficiency*.

**[Live demo →](#)** *(add your Vercel URL here after deploying)*

![Executive Overview screenshot](./docs/screenshot-overview.png)
*(replace with a real screenshot once you've run it locally — see below)*

## The idea

A finance team can see "$18,420 spent on OpenAI this month." What they can't easily see is whether that spend is *productive* — which teams are getting real output from AI spend, which vendor's costs are quietly outpacing the value it's producing, and what to actually do about it.

This prototype computes a **0–100 AI Spend Efficiency Score (ASES)** per team, weighted by productivity growth against cost growth, flags month-over-month vendor-level spend anomalies with a plain-English explanation, and surfaces ranked savings opportunities — then lets a CFO ask questions in natural language and get answers grounded in real transaction data, not estimates.

## What it does

- **Executive Overview** — total spend, company-wide efficiency score, spend-by-team breakdown
- **Team drill-down** — per-team ASES, top vendors, anomaly detection with severity scoring
- **Opportunities** — ranked savings opportunities (model substitution, duplicate tooling, underused subscriptions) with estimated monthly savings
- **Ask** — an LLM agent with tool-calling against live spend data; every answer cites the transactions it's grounded in

## Architecture

```
Seeded transaction data → Supabase (Postgres)
                                │
                      SQL views + RPC functions
              (rollups, ASES scoring, anomaly detection,
                    opportunity heuristics)
                                │
                        Next.js API routes
                                │
              Next.js dashboard + Groq-hosted tool-calling agent
```

Backend logic (scoring, anomaly detection, opportunity heuristics) lives in Postgres as SQL/RPC functions rather than application code — keeps the API routes thin and makes the logic independently testable and auditable, which matters for a finance-facing tool.

## Built with

Next.js 15 · TypeScript · Tailwind CSS · Supabase (Postgres) · Groq (`llama-3.3-70b-versatile`) with tool-calling

## Known limitations

Worth being upfront about, rather than letting someone else find them:

- **ASES weights are illustrative, not empirically derived.** The scoring formula demonstrates what the interaction model could feel like — it isn't validated against real business outcomes.
- **Anomaly detection is a single rule-based threshold**, not a trained model.
- **Data is synthetic**, generated to demonstrate the product thesis, not real spend data.
- **"Simulate change" is a static preview**, not a live what-if engine.

## Running it locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. Add your own key to `.env.local` for the `/ask` agent to work:

```
GROQ_API_KEY=your_key_here
```

Get one at [console.groq.com/keys](https://console.groq.com/keys). Everything else — dashboard, drill-downs, opportunities — works out of the box against the seeded database.

## License

MIT — see [LICENSE](./LICENSE).
