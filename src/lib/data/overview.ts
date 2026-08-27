import { CURRENT_PERIOD } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-server';
import type { OverviewResponse, TeamSpendSummary } from '@/types/api';
import type { TeamPeriodDeltas } from './types';

export async function fetchOverview(): Promise<OverviewResponse> {
  const supabase = await createClient();
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, name');

  if (teamsError || !teams) {
    throw new Error(teamsError?.message ?? 'Failed to load teams');
  }

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

  const prevTotal = perTeam.reduce((sum, t) => {
    const prevSpend = t.spendChangePct === 0 ? t.spendUSD : t.spendUSD / (1 + t.spendChangePct / 100);
    return sum + prevSpend;
  }, 0);
  const spendChangePct = prevTotal > 0 ? Math.round(((totalSpendUSD - prevTotal) / prevTotal) * 1000) / 10 : 0;

  const efficiencyScore = perTeam.length
    ? Math.round(perTeam.reduce((sum, t) => sum + t.ases, 0) / perTeam.length)
    : 0;

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

  return {
    totalSpendUSD: Math.round(totalSpendUSD * 100) / 100,
    spendChangePct,
    efficiencyScore,
    potentialSavingsUSD,
    spendByTeam,
  };
}
