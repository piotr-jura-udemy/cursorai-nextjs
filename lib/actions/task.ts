"use server";

import { z } from "zod";

// Reuse the same schema for server-side validation
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
});

export async function createTask(formData: z.infer<typeof taskFormSchema>) {
  // Server-side validation
  const result = taskFormSchema.safeParse(formData);

  if (!result.success) {
    throw new Error("Invalid task data");
  }

  // TODO: Replace with your actual database call
  console.log("Creating task:", result.data);

  // For now just return mock data
  return {
    id: crypto.randomUUID(),
    ...result.data,
    status: "TODO",
  };
}
