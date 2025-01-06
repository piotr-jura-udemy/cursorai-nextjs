"use client";

import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { TaskDialog } from "./task-dialog";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  title: string;
  children: React.ReactNode;
  onTaskCreate?: (task: { title: string; status: string }) => void;
}

export function KanbanColumn({
  title,
  children,
  onTaskCreate,
}: KanbanColumnProps) {
  return (
    <Card className="w-full min-w-[320px] max-w-[400px]">
      <CardHeader className="p-4">
        <CardTitle className="text-center text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">{title}</h3>
          <TaskDialog
            trigger={
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            }
            onSubmit={(data) => {
              onTaskCreate?.({
                ...data,
                status: title.toLowerCase(),
              });
            }}
          />
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
