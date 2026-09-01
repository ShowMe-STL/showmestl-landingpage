import {
  CardSkeleton,
  PageHeaderSkeleton,
  TableSkeleton,
  ToolbarSkeleton,
} from '@/components/admin-layout/loading-skeletons'

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardSkeleton className="h-56" />
      <div className="space-y-4">
        <ToolbarSkeleton />
        <TableSkeleton rows={10} />
      </div>
    </div>
  )
}
