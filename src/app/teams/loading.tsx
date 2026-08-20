import { Skeleton } from "@/components/skeleton";

export default function TeamsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-8 sm:py-10">
      <header className="mb-8">
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </header>

      <div className="bg-surface border border-border rounded-lg divide-y divide-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-4">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
