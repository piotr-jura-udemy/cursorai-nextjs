import { KanbanBoard } from "@/components/kanban-board";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="relative">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <KanbanBoard />
    </main>
  );
}
