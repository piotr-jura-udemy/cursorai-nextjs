import { db } from "@/lib/db/config";
import { columns, tasks } from "@/lib/db/schema";
const ARTIFICIAL_DELAY_MS = 3000;

export async function getColumns() {
  await new Promise((resolve) => setTimeout(resolve, ARTIFICIAL_DELAY_MS));
  return await db.select().from(columns).orderBy(columns.order);
}

export async function getTasks() {
  await new Promise((resolve) => setTimeout(resolve, ARTIFICIAL_DELAY_MS));
  return await db.select().from(tasks).orderBy(tasks.order);
}
