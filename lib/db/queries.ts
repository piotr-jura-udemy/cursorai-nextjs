import { db } from "@/lib/db/config";
import { columns, tasks } from "@/lib/db/schema";

export async function getColumns() {
  return await db.select().from(columns).orderBy(columns.order);
}

export async function getTasks() {
  return await db.select().from(tasks).orderBy(tasks.columnId);
}
