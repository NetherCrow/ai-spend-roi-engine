"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { Team } from "@/types/api";

export function TeamsPanel({ teams, canEdit }: { teams: Team[]; canEdit: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("teams").insert({ name: name.trim() });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setName("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <section className="animate-rise rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6">
      <h2 className="font-display text-base font-semibold text-text-primary">Teams</h2>
      <p className="text-sm text-text-muted mt-1 mb-4">
        Every transaction, vendor spend, and efficiency score is grouped by team.
      </p>

      <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {teams.length === 0 && (
          <div className="px-4 py-3 text-sm text-text-muted">No teams yet.</div>
        )}
        {teams.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-text-primary">{t.name}</span>
            {canEdit && (
              <button
                onClick={() => handleDelete(t.id)}
                className="text-text-muted hover:text-danger transition-colors"
                aria-label={`Remove ${t.name}`}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {canEdit && (
        <form onSubmit={handleAdd} className="mt-4 flex items-center gap-2">
          <div className="flex-1 border border-border bg-surface rounded-lg px-3 focus-within:border-accent/40 transition-colors">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New team name"
              className="w-full bg-transparent py-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !name.trim()}
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
