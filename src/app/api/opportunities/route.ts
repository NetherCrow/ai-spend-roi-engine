import { NextResponse } from 'next/server';
import { supabase, CURRENT_PERIOD } from '@/lib/supabase';
import type { OpportunitiesResponse, OpportunityItem } from '@/types/api';

export async function GET() {
  const { data, error } = await supabase.rpc('get_opportunities', { p_period: CURRENT_PERIOD });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const opportunities: OpportunityItem[] = (data ?? []).map(
    (
      row: {
        team_id: string;
        opp_type: string;
        title: string;
        description: string;
        estimated_savings_usd: number;
      },
      i: number
    ) => ({
      id: `${row.team_id}-${row.opp_type}-${i}`,
      type: row.opp_type as OpportunityItem['type'],
      title: row.title,
      description: row.description,
      estimatedMonthlySavingsUSD: row.estimated_savings_usd,
      staticSimulationDetails: `Applying this change is estimated to reduce monthly spend by $${row.estimated_savings_usd.toLocaleString()}. This is a static estimate based on the current period's data, not a live simulation.`,
    })
  );

  const response: OpportunitiesResponse = {
    opportunities: opportunities.sort((a, b) => b.estimatedMonthlySavingsUSD - a.estimatedMonthlySavingsUSD),
    totalPotentialSavingsUSD: opportunities.reduce((sum, o) => sum + o.estimatedMonthlySavingsUSD, 0),
  };

  return NextResponse.json(response);
}
