import { Skeleton } from "@/components/skeleton";

export default function OverviewLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:px-8 sm:py-10">
      <Skeleton className="h-3 w-40 mb-6" />

      <header className="mb-8">
        <Skeleton className="h-8 w-72 mb-2" />
        <Skeleton className="h-4 w-96" />
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-2">
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 lg:col-span-2 lg:row-span-2">
          <Skeleton className="h-3 w-28 mb-6" />
          <Skeleton className="h-14 w-64 mb-10" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="rounded-2xl border border-border bg-surface px-5 py-4 flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="rounded-full" style={{ width: 88, height: 62 }} />
        </div>
        <div className="rounded-2xl border border-border bg-surface px-5 py-4">
          <Skeleton className="h-3 w-32 mb-3" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface px-6 py-5">
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
