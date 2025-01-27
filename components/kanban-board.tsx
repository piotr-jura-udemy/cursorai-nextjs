import { getColumns, getTasks } from "@/lib/db/queries";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";

export async function KanbanBoard() {
  const [columns, tasks] = await Promise.all([getColumns(), getTasks()]);

  return (
    <div className="flex gap-6 p-6 overflow-x-auto min-h-screen">
      {columns.map((column) => (
        <KanbanColumn key={column.id} title={column.title} columnId={column.id}>
          {tasks
            .filter((task) => task.columnId === column.id)
            .map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                columnId={column.id}
                title={task.title}
                description={task.description}
                availableColumns={columns.filter((c) => c.id !== column.id)}
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
