import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import type { SupabaseClient } from '@supabase/supabase-js';
import { CURRENT_PERIOD, previousPeriod } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-server';
import type { AgentRequest, AgentResponse } from '@/types/api';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Groq's model catalog shifts fairly often — llama-3.3-70b-versatile was
// retired from the production catalog, so this is pinned to
// openai/gpt-oss-120b. Check console.groq.com/docs/models for what's
// current if tool calls start misfiring or returning 404s again.
const MODEL = 'openai/gpt-oss-120b';

// Groq's chat API is OpenAI-shaped: tools are { type: 'function', function: {...} },
// not Anthropic's flat tool schema.
const QUERY_SPEND_DATA_TOOL: Groq.Chat.Completions.ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'query_spend_data',
    description:
      'Query AI spend data for a specific team (or all teams if team_name is omitted). Returns spend, ' +
      'productivity change, ASES efficiency score, top vendors, and any detected anomalies for the current ' +
      'period vs the prior period. Always call this before answering a question about spend — never estimate ' +
      'numbers from memory.',
    parameters: {
      type: 'object',
      properties: {
        team_name: {
          type: ['string', 'null'],
          description: 'One of: Engineering, Marketing, Sales, Support. Use null to get all teams.',
        },
      },
    },
  },
};

interface TeamPeriodDeltas {
  spend_usd: number;
  spend_change_pct: number;
  productivity_change_pct: number;
}
interface VendorAnomalyRow {
  vendor_name: string;
  description: string;
  severity: number;
  spend_change_pct: number;
}
interface TransactionRow {
  id: string;
  amount_cents: number;
  occurred_at: string;
  vendor_id: string;
  vendors: { name: string } | null;
}

interface SpendQueryResult {
  period: string;
  previous_period: string;
  teams: {
    team: string;
    spend_usd: number;
    spend_change_pct_vs_prior_month: number;
    productivity_change_pct_vs_prior_month: number;
    efficiency_score_0_to_100: number;
    anomalies: { vendor: string; description: string; severity: number }[];
    top_transactions: { transaction_id: string; vendor: string; amount_usd: number; date: string }[];
  }[];
}

async function queryTeamSpendData(
  supabase: SupabaseClient,
  teamName?: string
): Promise<SpendQueryResult | { error: string }> {
  let teamsQuery = supabase.from('teams').select('id, name');
  if (teamName) teamsQuery = teamsQuery.ilike('name', teamName);
  const { data: teams } = await teamsQuery;
  if (!teams || teams.length === 0) return { error: `No team found matching "${teamName}"` };

  const results = await Promise.all(
    teams.map(async (team) => {
      const [{ data: deltas }, { data: ases }, { data: anomalies }, { data: recentTxns }] = await Promise.all([
        supabase
          .rpc('team_period_deltas', { p_team_id: team.id, p_period: CURRENT_PERIOD })
          .single<TeamPeriodDeltas>(),
        supabase.rpc('calculate_ases', { p_team_id: team.id, p_period: CURRENT_PERIOD }),
        supabase.rpc('get_vendor_anomalies', { p_team_id: team.id, p_period: CURRENT_PERIOD }) as unknown as Promise<{
          data: VendorAnomalyRow[] | null;
        }>,
        supabase
          .from('ai_transactions')
          .select('id, amount_cents, occurred_at, vendor_id, vendors(name)')
          .eq('team_id', team.id)
          .gte('occurred_at', CURRENT_PERIOD)
          .order('amount_cents', { ascending: false })
          .limit(5) as unknown as Promise<{ data: TransactionRow[] | null }>,
      ]);

      return {
        team: team.name,
        spend_usd: deltas?.spend_usd ?? 0,
        spend_change_pct_vs_prior_month: deltas?.spend_change_pct ?? 0,
        productivity_change_pct_vs_prior_month: deltas?.productivity_change_pct ?? 0,
        efficiency_score_0_to_100: ases ?? 0,
        anomalies: (anomalies ?? []).map((a) => ({
          vendor: a.vendor_name,
          description: a.description,
          severity: a.severity,
        })),
        top_transactions: (recentTxns ?? []).map((t) => ({
          transaction_id: t.id,
          vendor: t.vendors?.name ?? 'Unknown',
          amount_usd: t.amount_cents / 100,
          date: t.occurred_at,
        })),
      };
    })
  );

  return { period: CURRENT_PERIOD, previous_period: previousPeriod(CURRENT_PERIOD), teams: results };
}

const SYSTEM_PROMPT = `You are the AI Spend ROI Engine's analyst agent, embedded in a CFO-facing dashboard.

Rules:
- Always call query_spend_data before making any claim about spend, productivity, or efficiency. Never invent or estimate a figure.
- Cite specific numbers from the tool results in your answer.
- Keep answers to 2-4 sentences, direct and grounded — this is for a CFO who wants the number and the driver, not a narrative.
- If you reference a specific transaction, note its transaction_id so the UI can link to it.`;

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY is not set in .env.local' }, { status: 500 });
  }

  const { question }: AgentRequest = await req.json();
  if (!question?.trim()) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 });
  }

  const supabase = await createClient();

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: question },
  ];

  const citedTransactionIds: string[] = [];

  // Bounded tool-calling loop — a CFO question needs at most a couple of
  // lookups (e.g. "compare Marketing and Engineering"), so 4 turns is a
  // generous ceiling that still fails safely instead of looping forever.
  for (let turn = 0; turn < 4; turn++) {
    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 1000,
      tools: [QUERY_SPEND_DATA_TOOL],
      messages,
    });

    const choice = response.choices[0];
    const toolCalls = choice.message.tool_calls ?? [];

    if (toolCalls.length === 0) {
      const result: AgentResponse = { answer: choice.message.content ?? '', citedTransactionIds };
      return NextResponse.json(result);
    }

    messages.push(choice.message);

    for (const call of toolCalls) {
      let args: { team_name?: string } = {};
      try {
        args = JSON.parse(call.function.arguments || '{}');
      } catch {
        // malformed args from the model — proceed with no filter rather than fail the turn
      }
      const data = await queryTeamSpendData(supabase, args.team_name);
      if ('teams' in data) {
        for (const t of data.teams) {
          citedTransactionIds.push(...t.top_transactions.map((tx) => tx.transaction_id));
        }
      }
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(data),
      });
    }
  }

  return NextResponse.json({ error: 'Agent did not converge on an answer' }, { status: 500 });
}
