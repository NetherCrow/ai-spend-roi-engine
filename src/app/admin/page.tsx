import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { TeamsPanel } from "@/components/admin/teams-panel";
import { VendorsPanel } from "@/components/admin/vendors-panel";
import { EmployeesPanel } from "@/components/admin/employees-panel";
import type { Team, Vendor, Employee, Profile } from "@/types/api";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profileRow }, { data: teams }, { data: vendors }, { data: employees }] =
    await Promise.all([
      supabase
        .from("users")
        .select("role, organization_id, organizations(name)")
        .eq("id", user.id)
        .single(),
      supabase.from("teams").select("id, name").order("name"),
      supabase.from("vendors").select("id, name, category, organization_id").order("name"),
      supabase.from("employees").select("id, name, role, team_id").order("name"),
    ]);

  const org = profileRow?.organizations as unknown as { name: string } | null;
  const profile: Profile = {
    role: (profileRow?.role as Profile["role"]) ?? "viewer",
    organizationId: profileRow?.organization_id ?? "",
    organizationName: org?.name ?? "Your organization",
  };

  const teamList: Team[] = (teams ?? []).map((t) => ({ id: t.id, name: t.name }));
  const vendorList: Vendor[] = (vendors ?? []).map((v) => ({
    id: v.id,
    name: v.name,
    category: v.category,
    organizationId: v.organization_id,
  }));
  const employeeList: Employee[] = (employees ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    role: e.role,
    teamId: e.team_id,
  }));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-8 sm:py-10 pb-24 md:pb-10">
      <div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Admin
      </div>

      <header className="mb-8 animate-rise">
        <h1 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
          {profile.organizationName}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          {profile.role === "admin"
            ? "Manage the teams, vendors, and people your spend data is organized around."
            : "You have view-only access. Ask an admin on your team for changes."}
        </p>
      </header>

      <div className="space-y-8">
        <TeamsPanel teams={teamList} canEdit={profile.role === "admin"} />
        <VendorsPanel vendors={vendorList} canEdit={profile.role === "admin"} />
        <EmployeesPanel employees={employeeList} teams={teamList} canEdit={profile.role === "admin"} />
      </div>
    </div>
  );
}
