"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { columnFormSchema, type ColumnFormValues } from "@/lib/schemas";
import { createColumn, updateColumn } from "@/lib/actions/columns";

interface ColumnDialogProps {
  trigger?: React.ReactNode;
  mode?: "create" | "edit";
  defaultValues?: ColumnFormValues;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  columnId?: number;
}

export function ColumnDialog({
  trigger,
  mode = "create",
  defaultValues,
  open: controlledOpen,
  onOpenChange,
  columnId,
}: ColumnDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: defaultValues || {
      title: "",
    },
  });

  async function handleSubmit(data: ColumnFormValues) {
    try {
      if (mode === "create") {
        const result = await createColumn(data);
        if (result.error) {
          console.error("Failed to create column:", result.error);
          return;
        }
      } else {
        if (!columnId) {
          console.error("No columnId provided for edit mode");
          return;
        }
        const result = await updateColumn({ ...data, id: columnId });
        if (result.error) {
          console.error("Failed to update column:", result.error);
          return;
        }
      }

      form.reset();
      setOpen(false);
    } catch (error) {
      console.error(`Failed to ${mode} column:`, error);
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
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Column
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create" : "Edit"} Column
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
                    <Input placeholder="Column title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {mode === "create" ? "Create Column" : "Update Column"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
