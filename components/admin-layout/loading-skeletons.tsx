import { Skeleton } from '@/components/ui/skeleton'

// Shared skeletons for the admin route `loading.tsx` files. Each dashboard page
// is a dynamic server component doing its own Supabase reads, so without a
// Suspense fallback the router sits on the old page until the new one is ready.
// These give an instant, roughly page-shaped placeholder on every tab switch.

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-7 w-44" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  )
}

export function ToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Skeleton className="h-9 w-64 max-w-full rounded-md" />
      <Skeleton className="h-9 w-28 rounded-md" />
    </div>
  )
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="border-b bg-muted/30 px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
            <Skeleton className="h-4 w-full max-w-[220px]" />
            <Skeleton className="hidden h-4 w-24 sm:block" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton({ className = 'h-44' }: { className?: string }) {
  return <Skeleton className={`w-full rounded-xl ${className}`} />
}

export function CollectionSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="space-y-4">
        <ToolbarSkeleton />
        <TableSkeleton />
      </div>
    </div>
  )
}
