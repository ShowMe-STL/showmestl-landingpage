'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KanbanBoard, type TaskRow } from '@/components/dev-tasks/kanban-board'
import {
  PartnershipsManager,
  type PartnershipRow,
} from '@/components/dev-tasks/partnerships-manager'

export function DevTasksTabs({
  tasks,
  partnerships,
  completedTaskIds,
}: {
  tasks: TaskRow[]
  partnerships: PartnershipRow[]
  completedTaskIds: number[]
}) {
  return (
    <Tabs defaultValue="board" className="gap-4">
      <TabsList className="w-full overflow-x-auto sm:w-fit">
        <TabsTrigger value="board">Board</TabsTrigger>
        <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
      </TabsList>
      <TabsContent value="board">
        <KanbanBoard initialTasks={tasks} completedTaskIds={completedTaskIds} />
      </TabsContent>
      <TabsContent value="partnerships">
        <PartnershipsManager initialPartnerships={partnerships} />
      </TabsContent>
    </Tabs>
  )
}
