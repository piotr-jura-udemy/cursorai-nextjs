import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

interface TaskCardProps {
  title: string;
  description?: string;
}

export function TaskCard({ title, description }: TaskCardProps) {
  return (
    <Card className="mb-4 cursor-move">
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      {description && (
        <CardContent className="p-3 pt-0 text-sm text-muted-foreground">
          {description}
        </CardContent>
      )}
    </Card>
  );
}
