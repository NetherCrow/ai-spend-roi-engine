import { NextResponse } from 'next/server';
import { CURRENT_PERIOD } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-server';
import type { OverviewResponse, TeamSpendSummary } from '@/types/api';

// Return shape of the team_period_deltas() SQL function — the Supabase JS
// client can't infer RPC return types without generated DB types, so this
// is declared by hand to match the migration exactly.
interface TeamPeriodDeltas {
  spend_usd: number;
  spend_change_pct: number;
  productivity_output: number;
  productivity_change_pct: number;
}

export async function GET() {
  const supabase = await createClient();
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, name');

  if (teamsError || !teams) {
    return NextResponse.json({ error: teamsError?.message ?? 'Failed to load teams' }, { status: 500 });
  }

  // team_period_deltas and calculate_ases are per-team RPCs — call them in
  // parallel per team since there's no bulk RPC (fine at this scale; a
  // batched SQL function would be the move if this data grew much larger).
  const perTeam = await Promise.all(
    teams.map(async (team) => {
      const [{ data: deltas }, { data: ases }] = await Promise.all([
        supabase
          .rpc('team_period_deltas', { p_team_id: team.id, p_period: CURRENT_PERIOD })
          .single<TeamPeriodDeltas>(),
        supabase.rpc('calculate_ases', { p_team_id: team.id, p_period: CURRENT_PERIOD }),
      ]);
      return {
        teamId: team.id as string,
        teamName: team.name as string,
        spendUSD: (deltas?.spend_usd as number) ?? 0,
        spendChangePct: (deltas?.spend_change_pct as number) ?? 0,
        ases: (ases as number) ?? 0,
      };
    })
  );

  const totalSpendUSD = perTeam.reduce((sum, t) => sum + t.spendUSD, 0);

  // Weighted total spend change: sum of each team's absolute spend delta over
  // total previous-period spend, not a naive average of percentages.
  const prevTotal = perTeam.reduce((sum, t) => {
    const prevSpend = t.spendChangePct === 0 ? t.spendUSD : t.spendUSD / (1 + t.spendChangePct / 100);
    return sum + prevSpend;
  }, 0);
  const spendChangePct = prevTotal > 0 ? Math.round(((totalSpendUSD - prevTotal) / prevTotal) * 1000) / 10 : 0;

  const efficiencyScore = perTeam.length
    ? Math.round(perTeam.reduce((sum, t) => sum + t.ases, 0) / perTeam.length)
    : 0;

  // "Potential savings" placeholder until /api/opportunities' real heuristics
  // land — approximated here as spend attributable to teams below an
  // efficiency threshold, scaled down. Replace with a sum over real
  // opportunity rows once that endpoint exists.
  const potentialSavingsUSD = Math.round(
    perTeam.filter((t) => t.ases < 60).reduce((sum, t) => sum + t.spendUSD, 0) * 0.15
  );

  const spendByTeam: TeamSpendSummary[] = perTeam
    .map((t) => ({
      teamId: t.teamId,
      teamName: t.teamName,
      amountUSD: Math.round(t.spendUSD * 100) / 100,
      pctOfTotal: totalSpendUSD > 0 ? Math.round((t.spendUSD / totalSpendUSD) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amountUSD - a.amountUSD);

  const response: OverviewResponse = {
    totalSpendUSD: Math.round(totalSpendUSD * 100) / 100,
    spendChangePct,
    efficiencyScore,
    potentialSavingsUSD,
    spendByTeam,
  };

  return NextResponse.json(response);
}
