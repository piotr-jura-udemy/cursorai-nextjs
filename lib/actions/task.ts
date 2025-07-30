"use server";

import { db } from "@/lib/db/config";
import { tasks } from "@/lib/db/schema";
import { taskFormSchema, type TaskFormValues } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";

/**
 * Creates a new task in the database
 *
 * This function handles the complete task creation flow:
 * 1. Validates the incoming form data
 * 2. Determines the correct order position within the target column
 * 3. Inserts the task into the database
 * 4. Revalidates the UI cache
 *
 * @param formData - The task form data containing title, description, and columnId
 * @returns Object containing either the created task data or error information
 */
export async function createTask(formData: TaskFormValues) {
  try {
    // Validate the incoming form data against our schema
    const result = taskFormSchema.safeParse(formData);

    if (!result.success) {
      console.log(result.error.flatten().fieldErrors);
      return {
        error: "Invalid task data",
        details: result.error.flatten().fieldErrors,
      };
    }

    // Find the highest order number in the target column to position the new task at the end
    // This ensures tasks maintain their visual order in the UI
    const highestOrderTask = await db
      .select({ order: tasks.order })
      .from(tasks)
      .where(eq(tasks.columnId, result.data.columnId))
      .orderBy(desc(tasks.order))
      .limit(1);

    // Set new task order to be one higher than the current highest, or 0 if this is the first task
    const newOrder =
      highestOrderTask.length > 0 ? highestOrderTask[0].order + 1 : 0;

    // Insert the new task into the database and return the created record
    const task = await db
      .insert(tasks)
      .values({
        title: result.data.title,
        description: result.data.description || null, // Convert empty string to null
        columnId: result.data.columnId,
        order: newOrder,
      })
      .returning();

    // Revalidate the home page cache to reflect the new task in the UI
    revalidatePath("/");

    return { data: task[0] };
  } catch (error) {
    // Handle any unexpected database or system errors
    return {
      error: "Failed to create task",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Updates an existing task in the database
 *
 * This function handles the complete task update flow:
 * 1. Validates the incoming form data
 * 2. Verifies the task exists
 * 3. Updates the task with new information
 * 4. Revalidates the UI cache
 *
 * @param data - The task form data plus the task ID to update
 * @returns Object indicating success or containing error information
 */
export async function updateTask(data: TaskFormValues & { id: number }) {
  try {
    // Validate the incoming form data against our schema
    const result = taskFormSchema.safeParse(data);

    if (!result.success) {
      return {
        error: "Invalid task data",
        details: result.error.flatten().fieldErrors,
      };
    }

    // Verify that the task exists before attempting to update it
    // This prevents unnecessary database operations and provides better error feedback
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

    // Update the task with the validated data
    // Note: We don't update the order here as this is just content editing
    await db
      .update(tasks)
      .set({
        title: data.title,
        description: data.description || null, // Convert empty string to null
        columnId: data.columnId,
      })
      .where(eq(tasks.id, data.id));

    // Revalidate the home page cache to reflect changes in the UI
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

/**
 * Deletes a task from the database
 *
 * This is a straightforward deletion operation that:
 * 1. Removes the task from the database
 * 2. Revalidates the UI cache
 *
 * @param taskId - The ID of the task to delete
 * @returns Object indicating success or containing error information
 */
export async function deleteTask(taskId: number) {
  try {
    // Delete the task from the database
    await db.delete(tasks).where(eq(tasks.id, taskId));

    // Revalidate the home page cache to remove the task from the UI
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      error: "Failed to delete task",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Moves a task to a different column (drag and drop functionality)
 *
 * This function handles moving tasks between columns:
 * 1. Finds the current maximum order in the target column
 * 2. Updates the task's column and order to place it at the end
 * 3. Revalidates the UI cache
 *
 * Note: This implementation places moved tasks at the end of the target column.
 * A more sophisticated version could handle precise positioning within the column.
 *
 * @param taskId - The ID of the task to move
 * @param targetColumnId - The ID of the column to move the task to
 * @returns Object indicating success or containing error information
 */
export async function moveTask(taskId: number, targetColumnId: number) {
  try {
    // Find the highest order number in the target column
    // This determines where to place the moved task (at the end)
    const [maxOrder] = await db
      .select({ maxOrder: tasks.order })
      .from(tasks)
      .where(eq(tasks.columnId, targetColumnId))
      .orderBy(tasks.order)
      .limit(1);

    // Set the new order to be one higher than current max, or 0 if target column is empty
    const newOrder = maxOrder?.maxOrder ? maxOrder.maxOrder + 1 : 0;

    // Update the task's column and order in a single operation
    await db
      .update(tasks)
      .set({
        columnId: targetColumnId,
        order: newOrder,
      })
      .where(eq(tasks.id, taskId));

    // Revalidate the home page cache to reflect the task's new position
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      error: "Failed to move task",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
