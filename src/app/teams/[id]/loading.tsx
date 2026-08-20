import { Skeleton } from "@/components/skeleton";

export default function TeamDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-8 sm:py-10">
      <Skeleton className="h-4 w-20 mb-4" />

      <header className="mb-8">
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-56" />
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg px-5 py-4">
            <Skeleton className="h-3 w-16 mb-3" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
        <div className="col-span-2 sm:col-span-1 bg-surface border border-border rounded-lg px-5 py-4 flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="rounded-full" style={{ width: 64, height: 64 }} />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg px-6 py-5">
        <Skeleton className="h-4 w-32 mb-5" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
