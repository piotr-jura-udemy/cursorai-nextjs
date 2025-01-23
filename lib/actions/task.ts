"use server";

import { db } from "@/lib/db/config";
import { tasks } from "@/lib/db/schema";
import { taskFormSchema, type TaskFormValues } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";

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

    // Get the highest order in the column
    const highestOrderTask = await db
      .select({ order: tasks.order })
      .from(tasks)
      .where(eq(tasks.columnId, result.data.columnId))
      .orderBy(desc(tasks.order))
      .limit(1);

    const newOrder =
      highestOrderTask.length > 0 ? highestOrderTask[0].order + 1 : 0;

    const task = await db
      .insert(tasks)
      .values({
        title: result.data.title,
        description: result.data.description || null,
        columnId: result.data.columnId,
        order: newOrder,
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

export async function updateTask(data: TaskFormValues & { id: number }) {
  try {
    const result = taskFormSchema.safeParse(data);

    if (!result.success) {
      return {
        error: "Invalid task data",
        details: result.error.flatten().fieldErrors,
      };
    }

    // Check if task exists
    const existingTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, data.id))
      .limit(1);

    if (!existingTask) {
      return {
        error: "Task not found",
        details: "The task you're trying to update doesn't exist",
      };
    }

    await db
      .update(tasks)
      .set({
        title: data.title,
        description: data.description || null,
        columnId: data.columnId,
      })
      .where(eq(tasks.id, data.id));

    // Optionally revalidate paths
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to update task:", error);
    return {
      error: "Failed to update task",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
