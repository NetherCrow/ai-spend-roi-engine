// Return shapes of Supabase RPC calls — the JS client can't infer these
// without generated DB types, so they're declared by hand to match migrations.

export interface TeamPeriodDeltas {
  spend_usd: number;
  spend_change_pct: number;
  productivity_output: number;
  productivity_change_pct: number;
}

export interface VendorAnomalyRow {
  vendor_id: string;
  vendor_name: string;
  anomaly_type: string;
  description: string;
  severity: number;
  spend_change_pct: number;
}
