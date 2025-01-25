"use server";

import { db } from "@/lib/db/config";
import { columns } from "@/lib/db/schema";
import { columnFormSchema, type ColumnFormValues } from "@/lib/schemas";
import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createColumn(data: ColumnFormValues) {
  try {
    const result = columnFormSchema.safeParse(data);

    if (!result.success) {
      return {
        error: "Invalid column data",
        details: result.error.flatten().fieldErrors,
      };
    }

    // Get the highest order value
    const [lastColumn] = await db
      .select({ order: columns.order })
      .from(columns)
      .orderBy(desc(columns.order))
      .limit(1);

    const nextOrder = (lastColumn?.order ?? 0) + 1;

    await db.insert(columns).values({
      title: result.data.title,
      order: nextOrder,
    });

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return {
      error: "Failed to create column",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
