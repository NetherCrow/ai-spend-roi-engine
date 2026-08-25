"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-xs font-display font-bold text-white">
            R
          </span>
          <div>
            <div className="font-display font-semibold text-sm leading-none tracking-tight text-text-primary">
              Spend<span className="text-accent">ROI</span>
            </div>
            <div className="text-[11px] text-text-muted mt-1">AI spend intelligence</div>
          </div>
        </div>

        <div className="animate-rise rounded-2xl border border-border bg-surface px-6 py-7">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
            Welcome back
          </div>
          <h1 className="font-display text-xl font-semibold text-text-primary mb-6">Log in</h1>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-text-muted mb-1.5" htmlFor="email">
                Email
              </label>
              <div className="border border-border bg-surface rounded-lg px-3 focus-within:border-accent/40 transition-colors">
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent py-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
                  placeholder="you@company.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="border border-border bg-surface rounded-lg px-3 focus-within:border-accent/40 transition-colors">
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-2 text-sm text-text-primary outline-none placeholder:text-text-muted"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-xs text-danger">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Log in
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
