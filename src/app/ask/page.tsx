"use client";

import { useState } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import type { AgentResponse } from "@/types/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citedTransactionIds?: string[];
}

const SUGGESTIONS = [
  "Which team has the worst efficiency score?",
  "Where's the biggest optimization opportunity?",
  "Any spend anomalies this period?",
];

export default function AskPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(question: string) {
    if (!question.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data: AgentResponse & { error?: string } = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.ok ? data.answer : `Error: ${data.error}`,
          citedTransactionIds: data.citedTransactionIds,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong reaching the agent. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-8 sm:py-10 flex flex-col h-[100dvh] pb-20 md:pb-10">
      <div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Ask
      </div>

      <header className="mb-6 animate-rise">
        <h1 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">Ask</h1>
        <p className="text-sm text-text-muted mt-1">
          Every answer is grounded in live spend data — nothing here is estimated from memory.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="animate-rise flex flex-col items-center justify-center h-full text-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-dim text-accent">
              <Sparkles size={18} />
            </span>
            <div className="grid gap-2 w-full max-w-sm">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="card-hover text-left text-sm text-text-primary bg-surface border border-border rounded-lg px-4 py-3"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg px-4 py-3 text-sm max-w-[85%] ${
              m.role === "user"
                ? "bg-accent-dim text-text-primary ml-auto"
                : "bg-surface border border-border text-text-primary"
            }`}
          >
            {m.content}
            {!!m.citedTransactionIds?.length && (
              <div className="mt-2 pt-2 border-t border-border/50 text-[11px] text-text-muted font-mono tabular-nums">
                Cited: {m.citedTransactionIds.slice(0, 3).join(", ")}
                {m.citedTransactionIds.length > 3 ? ` +${m.citedTransactionIds.length - 3} more` : ""}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Loader2 size={14} className="animate-spin" /> Querying spend data…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex items-center gap-2 border border-border bg-surface rounded-lg px-3 py-2 focus-within:border-accent/40 transition-colors"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about AI spend, efficiency, or anomalies…"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
        />
        <button type="submit" disabled={loading} className="text-accent disabled:text-text-muted">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
