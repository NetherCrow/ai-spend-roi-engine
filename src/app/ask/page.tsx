"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import type { AgentResponse } from "@/types/api";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citedTransactionIds?: string[];
}

const SUGGESTED = [
  "Why did AI spending increase this month?",
  "Which team has the lowest efficiency score?",
  "What's driving Marketing's spend this period?",
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
    <div className="max-w-3xl mx-auto px-8 py-10 flex flex-col h-screen">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-text-primary">Ask</h1>
        <p className="text-sm text-text-muted mt-1">
          Every answer is grounded in live spend data — nothing here is estimated from memory.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            {SUGGESTED.map((q) => (
              <button
                key={q}
                onClick={() => ask(q)}
                className="block w-full text-left text-sm text-text-muted hover:text-accent bg-surface border border-border rounded-md px-4 py-3 transition-colors"
              >
                {q}
              </button>
            ))}
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
              <div className="mt-2 pt-2 border-t border-border/50 text-[11px] text-text-muted tabular">
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
        className="flex items-center gap-2 border border-border bg-surface rounded-lg px-3 py-2"
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
