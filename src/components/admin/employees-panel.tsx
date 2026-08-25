"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { Employee, Team } from "@/types/api";

export function EmployeesPanel({
  employees,
  teams,
  canEdit,
}: {
  employees: Employee[];
  teams: Team[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teamName = (id: string | null) => teams.find((t) => t.id === id)?.name ?? "Unassigned";

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !teamId) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("employees")
      .insert({ name: name.trim(), role: role.trim() || null, team_id: teamId });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setName("");
    setRole("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <section className="animate-rise rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6">
      <h2 className="font-display text-base font-semibold text-text-primary">People</h2>
      <p className="text-sm text-text-muted mt-1 mb-4">
        Employees feed productivity metrics and let transactions be attributed to a person.
      </p>

      <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {employees.length === 0 && (
          <div className="px-4 py-3 text-sm text-text-muted">No people yet.</div>
        )}
        {employees.map((e) => (
          <div key={e.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-text-primary">{e.name}</span>
              <span className="text-[11px] text-text-muted">
                {teamName(e.teamId)}
                {e.role ? ` · ${e.role}` : ""}
              </span>
            </div>
            {canEdit && (
              <button
                onClick={() => handleDelete(e.id)}
                className="text-text-muted hover:text-danger transition-colors"
                aria-label={`Remove ${e.name}`}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {canEdit && (
        <form onSubmit={handleAdd} className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[140px] border border-border bg-surface rounded-lg px-3 focus-within:border-accent/40 transition-colors">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full bg-transparent py-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
          <div className="flex-1 min-w-[120px] border border-border bg-surface rounded-lg px-3 focus-within:border-accent/40 transition-colors">
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role (optional)"
              className="w-full bg-transparent py-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="border border-border bg-surface rounded-lg px-2 py-2 text-sm text-text-primary outline-none focus:border-accent/40 transition-colors"
          >
            {teams.length === 0 && <option value="">No teams yet</option>}
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading || !name.trim() || !teamId}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </section>
  );
}
