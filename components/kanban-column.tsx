"use client";

import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { TaskDialog } from "./task-dialog";
import { ColumnDialog } from "./column-dialog";
import { Button } from "./ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { deleteColumn } from "@/lib/actions/columns";

interface KanbanColumnProps {
  title: string;
  children: React.ReactNode;
  columnId: number;
}

export function KanbanColumn({ title, children, columnId }: KanbanColumnProps) {
  return (
    <Card className="w-full min-w-[320px] max-w-[400px]">
      <CardHeader className="p-4">
        <CardTitle className="text-center text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">{title}</h3>
          <div className="flex items-center gap-2">
            <TaskDialog
              trigger={
                <Button size="sm" variant="ghost">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              }
              columnId={columnId}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <ColumnDialog
                  mode="edit"
                  columnId={columnId}
                  defaultValues={{ title }}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Edit Column
                    </DropdownMenuItem>
                  }
                />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => deleteColumn(columnId)}
                >
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
