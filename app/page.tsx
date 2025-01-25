import { KanbanBoard } from "@/components/kanban-board";
import { ColumnDialog } from "@/components/column-dialog";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-end mb-6">
        <ColumnDialog />
      </div>
      <KanbanBoard />
    </main>
  );
}
