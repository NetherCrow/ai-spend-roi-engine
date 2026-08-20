import { Skeleton } from "@/components/skeleton";

export default function OpportunitiesLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-8 sm:py-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="h-7 w-44 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="sm:text-right">
          <Skeleton className="h-3 w-28 mb-2 sm:ml-auto" />
          <Skeleton className="h-8 w-32" />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg px-5 py-4 flex flex-col">
            <Skeleton className="h-3 w-28 mb-3" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3.5 w-full mb-1.5" />
            <Skeleton className="h-3.5 w-2/3 mb-4" />
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
