import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="p-8">
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome</h1>
        <Button>Click me</Button>
      </Card>
    </main>
  );
}
