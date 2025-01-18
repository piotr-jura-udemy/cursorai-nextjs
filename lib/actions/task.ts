"use server";

import { db } from "@/lib/db/config";
import { tasks } from "@/lib/db/schema";
import { taskFormSchema, type TaskFormValues } from "@/lib/schemas";
import { revalidatePath } from "next/cache";

export async function createTask(formData: TaskFormValues) {
  try {
    const result = taskFormSchema.safeParse(formData);

    if (!result.success) {
      console.log(result.error.flatten().fieldErrors);
      return {
        error: "Invalid task data",
        details: result.error.flatten().fieldErrors,
      };
    }

    const task = await db
      .insert(tasks)
      .values({
        title: result.data.title,
        description: result.data.description || null,
        priority: result.data.priority,
        dueDate: result.data.dueDate || null,
        status: "TODO",
      })
      .returning();

    revalidatePath("/");

    return { data: task[0] };
  } catch (error) {
    return {
      error: "Failed to create task",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
