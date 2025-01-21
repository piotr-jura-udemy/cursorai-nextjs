# Frontend & Forms

## Forms

- Use React Hook Form always, suggest installing if not installed yet.
- Always create a function that handles the form submission
- Example submission function:

```ts
async function handleSubmit(data: TaskFormValues) {
  try {
    await createTask(data);
    setOpen(false);
    form.reset();
  } catch (error) {
    console.error("Failed to create task:", error);
  }
}
```

- The form data should be typed, you can infer the type from ZOD schema, for example:

```ts
export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  columnId: z.number(),
});
export type TaskFormValues = z.infer<typeof taskFormSchema>;
```

- Try to reuse existing forms for edit form, when a form for resource creation exists

## Validation

- Always validate the data on the client
- Always use ZOD
- Suggest installing ZOD if not installed yet
- Always create schema inside @schemas.ts
- Try to use existing schemas when possbile

## UI Components

- Always use Shadcn/UI
- Suggest installing missing components
- Always use Shadcn/UI for forms

## Component Examples

- When needing a dialog, model after @task-dialog.tsx
