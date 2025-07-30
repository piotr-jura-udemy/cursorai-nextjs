import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const columns = pgTable("columns", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  columnId: integer("column_id").references(() => columns.id, {
    onDelete: "cascade",
  }),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
