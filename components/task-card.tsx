"use client";

import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { TaskDialog } from "./task-dialog";
import { assignees } from "@/lib/data/assignees";
import { TaskFormValues } from "@/lib/schemas";
import { deleteTask } from "@/lib/actions/task";

interface TaskCardProps {
  id: number;
  columnId: number;
  title: string;
  description?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  onAssigneeChange?: (userId: string) => void;
  onTaskUpdate?: (data: TaskFormValues) => void;
}

export function TaskCard({
  id,
  columnId,
  title,
  description,
  assignee: assigneeProp,
  onAssigneeChange,
  onTaskUpdate,
}: TaskCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const assignee = assignees.find((a) => a.id === assigneeProp?.id);

  const handleDelete = async () => {
    const result = await deleteTask(id);
    if (result.error) {
      // You might want to add toast notification here
      console.error(result.error);
    }
  };

  return (
    <>
      <Card className="mb-4 cursor-move hover:shadow-md transition-shadow">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={assignee?.id} onValueChange={onAssigneeChange}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Assign to...">
                    {assignee && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={assignee?.avatarUrl} />
                          <AvatarFallback>{assignee?.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="truncate">{assignee.name}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {assignees.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={member.avatarUrl}
                            alt={member.name}
                          />
                          <AvatarFallback>
                            {member.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        {description && (
          <CardContent className="p-4 pt-2 text-sm text-muted-foreground">
            {description}
          </CardContent>
        )}
      </Card>

      <TaskDialog
        mode="edit"
        columnId={columnId}
        taskId={id}
        defaultValues={{
          title,
          description: description || "",
          columnId,
        }}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
