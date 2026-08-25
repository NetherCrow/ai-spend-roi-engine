import { NextResponse } from 'next/server';
import { CURRENT_PERIOD } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-server';
import type { TeamDetailResponse, VendorSpend, Anomaly } from '@/types/api';

// Hand-declared return shapes for RPC calls — see the matching note in
// /api/overview/route.ts for why these can't be inferred automatically.
interface TeamPeriodDeltas {
  spend_usd: number;
  spend_change_pct: number;
  productivity_output: number;
  productivity_change_pct: number;
}

interface VendorAnomalyRow {
  vendor_id: string;
  vendor_name: string;
  anomaly_type: string;
  description: string;
  severity: number;
  spend_change_pct: number;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('id, name')
    .eq('id', id)
    .single();

  if (teamError || !team) {
    return NextResponse.json({ error: 'Team not found' }, { status: 404 });
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

  const response: TeamDetailResponse = {
    teamId: team.id,
    teamName: team.name,
    spendUSD: Math.round((deltas?.spend_usd ?? 0) * 100) / 100,
    productivityChangePct,
    usageChangePct: spendChangePct, // transaction volume proxy; see note below
    costEfficiencyChangePct: productivityChangePct - spendChangePct,
    efficiencyScore: (ases as number) ?? 0,
    topProviders,
    anomalies,
  };

  return NextResponse.json(response);
}

// Note: `usageChangePct` currently reuses spend_change_pct as a stand-in for
// transaction-volume growth. If the drill-down needs a true usage metric
// distinct from dollar spend, add a `transaction_count` delta to the
// team_period_deltas() SQL function rather than approximating it here.
