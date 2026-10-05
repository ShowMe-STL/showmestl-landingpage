import {
  PageHeaderSkeleton,
  ToolbarSkeleton,
  CardSkeleton,
} from '@/components/admin-layout/loading-skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <Skeleton className="h-8 w-64 max-w-full rounded-lg" />
      <ToolbarSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}
