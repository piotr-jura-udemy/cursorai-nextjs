import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

interface KanbanColumnProps {
  title: string;
  children: React.ReactNode;
}

export function KanbanColumn({ title, children }: KanbanColumnProps) {
  return (
    <Card className="w-full min-w-[320px] max-w-[400px]">
      <CardHeader className="p-4">
        <CardTitle className="text-center text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">{children}</CardContent>
    </Card>
  );
}
