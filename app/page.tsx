import KanbanBoard from "@/components/kanban-board";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-4">
      <KanbanBoard />
    </main>
  );
}
