import { Skeleton } from "@/components/skeleton";

export default function OverviewLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-8 sm:py-10">
      <header className="mb-8">
        <Skeleton className="h-7 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-lg px-5 py-4">
          <Skeleton className="h-3 w-20 mb-3" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="bg-surface border border-border rounded-lg px-5 py-4 flex items-center justify-between">
          <div className="flex-1">
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="rounded-full" style={{ width: 72, height: 72 }} />
        </div>
        <div className="bg-surface border border-border rounded-lg px-5 py-4">
          <Skeleton className="h-3 w-36 mb-3" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg px-6 py-5">
        <Skeleton className="h-4 w-40 mb-5" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3.5 w-20" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
