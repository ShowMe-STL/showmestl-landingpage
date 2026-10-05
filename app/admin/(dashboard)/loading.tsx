import { Skeleton } from '@/components/ui/skeleton'
import { PageHeaderSkeleton } from '@/components/admin-layout/loading-skeletons'

// Fallback for the Overview page (and any child route without its own).
export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-px w-full" />

      <div className="space-y-4">
        <Skeleton className="h-9 w-full max-w-md rounded-lg" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    </div>
  )
}
