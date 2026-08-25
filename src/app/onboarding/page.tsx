import Link from "next/link";
import {
  LayoutGrid,
  Building2,
  Sparkles,
  MessageCircleQuestion,
  Shield,
  ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    icon: LayoutGrid,
    title: "Overview",
    description:
      "Your company-wide AI spend, efficiency score, and biggest optimization opportunity at a glance.",
  },
  {
    icon: Building2,
    title: "Teams",
    description:
      "Spend and efficiency broken down per team, so you can see who's getting the most out of their AI budget.",
  },
  {
    icon: Sparkles,
    title: "Opportunities",
    description:
      "Concrete, static-simulated ways to cut spend — model substitutions, duplicate tooling, unused subscriptions.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Ask",
    description:
      "Ask questions in plain English. Every answer is grounded in your live spend data, never estimated.",
  },
  {
    icon: Shield,
    title: "Admin",
    description: "Add or remove teams, vendors, and people as your organization actually looks.",
  },
];

export default function OnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:px-8 sm:py-16">
      <div className="mb-10 animate-rise flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-sm font-display font-bold text-white">
          R
        </span>
        <div>
          <div className="font-display font-semibold text-base leading-none tracking-tight text-text-primary">
            Spend<span className="text-accent">ROI</span>
          </div>
          <div className="text-[11px] text-text-muted mt-1">AI spend intelligence</div>
        </div>
      </div>

      <header className="mb-10 animate-rise" style={{ animationDelay: "60ms" }}>
        <h1 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
          Welcome — here&apos;s what you&apos;re looking at
        </h1>
        <p className="text-sm text-text-muted mt-2 leading-relaxed">
          We&apos;ve pre-loaded a sample organization — a few teams, some people, and two months of
          AI vendor spend — so there&apos;s something real to explore right away. Nothing here is
          permanent; add, edit, or remove any of it from Admin whenever you&apos;re ready to bring
          in your own.
        </p>
      </header>

      <div className="space-y-3">
        {STEPS.map(({ icon: Icon, title, description }, i) => (
          <div
            key={title}
            className="animate-rise flex items-start gap-4 rounded-2xl border border-border bg-surface px-5 py-4"
            style={{ animationDelay: `${120 + i * 60}ms` }}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-dim text-accent">
              <Icon size={17} strokeWidth={2} />
            </span>
            <div>
              <div className="font-display text-sm font-semibold text-text-primary">{title}</div>
              <p className="text-sm text-text-muted mt-0.5 leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/"
        className="animate-rise mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:w-auto sm:px-6"
        style={{ animationDelay: `${120 + STEPS.length * 60}ms` }}
      >
        Go to dashboard
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}
