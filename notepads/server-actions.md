# Creating Server Actions

## Source of Truth

- Always take a look at the DB schema first.
- Unless I explicitly ask, never modify the database schema!
- This is the db schema: @schema.ts

## Validation

- Always validate the input first
- Unless told otherwise, use ZOD to validate
- Create the ZOD schema, if it's missing, inside the schema file @schemas.ts
- Strive to reuse the existing schema if it's already there

## Generic

- Serve action files should always start with "use server" directive

## Database

- Always use Drizzle

## Libraries

- Never install or use any extra libraries, unless I EXPLICITLY ASK FOR IT!

## Errors

- Don't throw exceptions, instead return the error info, looking like this:

```ts
if (!result.success) {
  return {
    error: "Specific generic message here",
    details: result.error.flatten().fieldErrors,
  };
}
```

- Try to surround with try...catch, so if anything goes wrong, there's at least a generic error:

```ts
} catch (error) {
  return {
    error: "Generic desc error here",
    details:
      error instanceof Error ? error.message : "Unknown error occurred",
  };
}
```

## Cache

- Suggest path revalidation if you can guess what needs to be revalidated, but always just add a commented out code!

## Colocation

- Try to add actions to existing files, that contain similar logic. If not found, create a new one.
