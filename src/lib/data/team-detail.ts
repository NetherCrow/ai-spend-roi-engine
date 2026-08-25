import { getSupabase, CURRENT_PERIOD } from '@/lib/supabase';
import type { TeamDetailResponse, VendorSpend, Anomaly } from '@/types/api';
import type { TeamPeriodDeltas, VendorAnomalyRow } from './types';

export async function fetchTeamDetail(id: string): Promise<TeamDetailResponse> {
  const supabase = getSupabase();
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id, name')
    .eq('id', id)
    .single();

  if (teamError || !team) {
    throw new Error('Team not found');
  }

  const [{ data: deltas }, { data: ases }, { data: topProvidersRaw }, { data: vendorAnomalies }] =
    await Promise.all([
      supabase
        .rpc('team_period_deltas', { p_team_id: id, p_period: CURRENT_PERIOD })
        .single<TeamPeriodDeltas>(),
      supabase.rpc('calculate_ases', { p_team_id: id, p_period: CURRENT_PERIOD }),
      supabase
        .from('team_vendor_monthly_spend')
        .select('vendor_id, vendor_name, spend_usd')
        .eq('team_id', id)
        .eq('period_start', CURRENT_PERIOD)
        .order('spend_usd', { ascending: false }),
      supabase.rpc('get_vendor_anomalies', { p_team_id: id, p_period: CURRENT_PERIOD }) as unknown as Promise<{
        data: VendorAnomalyRow[] | null;
      }>,
    ]);

  const topProviders: VendorSpend[] = (topProvidersRaw ?? []).map((v) => ({
    vendorId: v.vendor_id as string,
    vendorName: v.vendor_name as string,
    amountUSD: Math.round((v.spend_usd as number) * 100) / 100,
  }));

  const anomalies: Anomaly[] = (vendorAnomalies ?? []).map((a, i: number) => ({
    id: `${id}-${CURRENT_PERIOD}-${i}`,
    type: 'vendor_spend_spike',
    description: a.description,
    severity: a.severity,
  }));

  const productivityChangePct = deltas?.productivity_change_pct ?? 0;
  const spendChangePct = deltas?.spend_change_pct ?? 0;

  return {
    teamId: team.id,
    teamName: team.name,
    spendUSD: Math.round((deltas?.spend_usd ?? 0) * 100) / 100,
    productivityChangePct,
    usageChangePct: spendChangePct,
    costEfficiencyChangePct: productivityChangePct - spendChangePct,
    efficiencyScore: (ases as number) ?? 0,
    topProviders,
    anomalies,
  };
}
