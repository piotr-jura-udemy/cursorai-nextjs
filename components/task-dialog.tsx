"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { assignees } from "@/lib/data/assignees";
import { createTask, updateTask } from "@/lib/actions/task";
import { useState } from "react";
import { taskFormSchema, type TaskFormValues } from "@/lib/schemas";

interface TaskDialogProps {
  trigger?: React.ReactNode;
  columnId: number;
  mode?: "create" | "edit";
  defaultValues?: TaskFormValues;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  taskId?: number;
}

export function TaskDialog({
  trigger,
  columnId,
  mode = "create",
  defaultValues,
  open: controlledOpen,
  onOpenChange,
  taskId,
}: TaskDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaultValues || {
      title: "",
      description: "",
      columnId: columnId,
    },
  });

  async function handleSubmit(data: TaskFormValues) {
    console.log("handleSubmit called with data:", data);
    try {
      if (mode === "create") {
        await createTask(data);
      } else {
        if (!taskId) {
          console.error("No taskId provided for edit mode");
          return;
        }
        await updateTask({ ...data, id: taskId });
      }
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error(`Failed to ${mode} task:`, error);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          form.reset();
        }
        setOpen(newOpen);
      }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create" : "Edit"} Task
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Task description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {mode === "create" ? "Create" : "Save"} Task
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
