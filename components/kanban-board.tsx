import { getColumns, getTasks } from "@/lib/db/queries";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";

export default async function KanbanBoard() {
  const [columns, tasks] = await Promise.all([getColumns(), getTasks()]);

  return (
    <div className="flex gap-6 p-6 overflow-x-auto min-h-screen">
      {columns.map((column) => (
        <KanbanColumn key={column.id} title={column.title}>
          {tasks
            .filter((task) => task.columnId === column.id)
            .map((task) => (
              <TaskCard
                key={task.id}
                title={task.title}
                description={task.description}
                assignee={
                  task.assigneeId
                    ? {
                        id: task.assigneeId,
                        name: "", // We'll need to fetch users/assignees later
                      }
                    : undefined
                }
              />
            ))}
        </KanbanColumn>
      ))}
    </div>
  );
}
