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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { deleteColumn } from "@/lib/actions/columns";
import { useState } from "react";

interface KanbanColumnProps {
  title: string;
  children: React.ReactNode;
  columnId: number;
}

export function KanbanColumn({ title, children, columnId }: KanbanColumnProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

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
                  onClick={() => setShowDeleteAlert(true)}
                >
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {children}
      </CardContent>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the column "{title}" and all its
              tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteColumn(columnId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
