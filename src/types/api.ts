// Shared API contract — the source of truth for both frontend and backend.
// Person B can build the UI against these types using mock data before
// Person A's real endpoints exist; the shapes must not drift from this file.

export interface TeamSpendSummary {
  teamId: string;
  teamName: string;
  amountUSD: number;
  pctOfTotal: number;
}

export interface OverviewResponse {
  totalSpendUSD: number;
  spendChangePct: number;
  efficiencyScore: number; // 0-100, average ASES across teams
  potentialSavingsUSD: number;
  spendByTeam: TeamSpendSummary[];
}

export interface VendorSpend {
  vendorId: string;
  vendorName: string;
  amountUSD: number;
}

export interface Anomaly {
  id: string;
  type: 'spend_spike' | 'usage_spike' | 'cost_inefficiency' | 'vendor_spend_spike';
  description: string;
  severity: number; // 0-100
}

export interface TeamDetailResponse {
  teamId: string;
  teamName: string;
  spendUSD: number;
  productivityChangePct: number;
  usageChangePct: number;
  costEfficiencyChangePct: number;
  efficiencyScore: number;
  topProviders: VendorSpend[];
  anomalies: Anomaly[];
}

export interface OpportunityItem {
  id: string;
  type: 'model_substitution' | 'unused_subscription' | 'duplicate_tooling';
  title: string;
  description: string;
  estimatedMonthlySavingsUSD: number;
  staticSimulationDetails?: string;
}

export interface OpportunitiesResponse {
  opportunities: OpportunityItem[];
  totalPotentialSavingsUSD: number;
}

export interface AgentRequest {
  question: string;
}

export interface AgentResponse {
  answer: string;
  citedTransactionIds: string[];
}

export interface ApiError {
  error: string;
}

export interface Team {
  id: string;
  name: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: 'llm_api' | 'coding_assistant' | 'image_gen' | 'other';
  organizationId: string | null; // null = shared catalog vendor, visible to every org
}

export interface Employee {
  id: string;
  name: string;
  role: string | null;
  teamId: string | null;
}

export interface Profile {
  role: 'admin' | 'viewer';
  organizationId: string;
  organizationName: string;
}
