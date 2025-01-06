import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";

export function KanbanBoard() {
  return (
    <div className="flex gap-6 p-6 overflow-x-auto min-h-screen">
      <KanbanColumn title="Todo">
        <TaskCard
          title="Implement authentication"
          description="Set up NextAuth.js for user authentication"
        />
        <TaskCard
          title="Design system"
          description="Create consistent component library"
        />
      </KanbanColumn>

      <KanbanColumn title="In Progress">
        <TaskCard
          title="Kanban board"
          description="Create drag and drop kanban board"
        />
      </KanbanColumn>

      <KanbanColumn title="Done">
        <TaskCard
          title="Project setup"
          description="Initial project configuration"
        />
      </KanbanColumn>
    </div>
  );
}
