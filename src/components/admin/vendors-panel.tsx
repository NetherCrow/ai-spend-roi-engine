"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import type { Vendor } from "@/types/api";

const CATEGORIES: { value: Vendor["category"]; label: string }[] = [
  { value: "llm_api", label: "LLM API" },
  { value: "coding_assistant", label: "Coding assistant" },
  { value: "image_gen", label: "Image generation" },
  { value: "other", label: "Other" },
];

export function VendorsPanel({ vendors, canEdit }: { vendors: Vendor[]; canEdit: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Vendor["category"]>("llm_api");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("vendors").insert({ name: name.trim(), category });
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
    const { error } = await supabase.from("vendors").delete().eq("id", id);
    if (error) {
      setError(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <section className="animate-rise rounded-2xl border border-border bg-surface px-5 py-5 sm:px-6">
      <h2 className="font-display text-base font-semibold text-text-primary">Vendors</h2>
      <p className="text-sm text-text-muted mt-1 mb-4">
        Shared vendors are visible to every organization. Vendors you add here are private to
        yours.
      </p>

      <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
        {vendors.length === 0 && (
          <div className="px-4 py-3 text-sm text-text-muted">No vendors yet.</div>
        )}
        {vendors.map((v) => (
          <div key={v.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-text-primary">{v.name}</span>
              <span className="text-[11px] text-text-muted font-mono uppercase tracking-wide">
                {CATEGORIES.find((c) => c.value === v.category)?.label ?? v.category}
              </span>
              {v.organizationId === null && (
                <span className="text-[10px] font-mono uppercase tracking-wide text-accent bg-accent-dim rounded px-1.5 py-0.5">
                  Shared
                </span>
              )}
            </div>
            {canEdit && v.organizationId !== null && (
              <button
                onClick={() => handleDelete(v.id)}
                className="text-text-muted hover:text-danger transition-colors"
                aria-label={`Remove ${v.name}`}
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
              placeholder="New vendor name"
              className="w-full bg-transparent py-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Vendor["category"])}
            className="border border-border bg-surface rounded-lg px-2 py-2 text-sm text-text-primary outline-none focus:border-accent/40 transition-colors"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
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
