---
alwaysApply: true
---

# Next.js 15 (React 19) Rules

## This Project

- The root directory is `trello-app`

## Project Structure

- Use App Router with `page.tsx` files in route directories
- Use kebab-case for directories (`components/auth-form`), PascalCase for component files
- Prefer named exports over default exports: `export function Button() { /* ... */ }`

## Component Architecture

- Favor React Server Components (RSC) by default
- Minimize `'use client'` directives:
  - Only use for interactivity, event handlers, browser APIs
  - Create small client wrappers around interactive elements
  - Wrap in `Suspense` with fallback UI
- Structure components: exports, subcomponents, helpers, types
- **CRITICAL: Server Components cannot pass event handlers to Client Components**
  - If you get an error about passing event handlers from Server to Client Components
  - Add `'use client'` directive to convert the component to a Client Component
  - This commonly happens when Server Components try to pass onClick handlers to Next.js Link components
  - Example fix: Add `'use client'` at the top of the component file

## State Management & Forms

### useActionState (Preferred over useFormState)

```typescript
// CORRECT: Use useActionState for form handling
const [state, formAction] = useActionState(serverAction, {
  success: false,
  error: null,
});

// Handle both thrown errors and returned state
const handleSubmit = async (formData: FormData) => {
  try {
    await formAction(formData);
  } catch (error) {
    // Handle thrown errors (validation, etc.)
    setError(error instanceof Error ? error.message : "An error occurred");
  }
};
```

### useFormStatus for Loading States

```typescript
// Use inside form components to detect submission state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
```

### Optimistic Updates with Error Handling

```typescript
// Pattern for optimistic updates with rollback
const [displayValue, setDisplayValue] = useState(initialValue);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleUpdate = async (newValue: string) => {
  // Validate before optimistic update
  if (newValue.trim().length === 0) {
    setError("Value is required");
    return;
  }

  setIsLoading(true);
  setError(null);

  // Optimistic update
  const previousValue = displayValue;
  setDisplayValue(newValue);

  try {
    await updateAction(newValue);
    // Success - optimistic update was correct
  } catch (error) {
    // Rollback optimistic update
    setDisplayValue(previousValue);
    setError(error instanceof Error ? error.message : "Update failed");
  } finally {
    setIsLoading(false);
  }
};
```

## Validation with Zod

### Schema Definition

```typescript
// Define validation schemas
import { z } from "zod";

const boardSchema = z.object({
  name: z
    .string()
    .min(1, "Board name is required")
    .max(50, "Board name must be less than 50 characters")
    .trim(),
});

type BoardInput = z.infer<typeof boardSchema>;
```

### Server Action Validation

```typescript
// Server action with Zod validation
export async function createBoard(formData: FormData) {
  const result = boardSchema.safeParse({
    name: formData.get("name"),
  });

  if (!result.success) {
    // Return validation errors in a consistent format
    throw new Error(result.error.errors[0].message);
  }

  const { name } = result.data;

  try {
    const board = await prisma.board.create({
      data: { name },
    });

    revalidatePath("/");
  } catch (error) {
    throw new Error("Failed to create board");
  }

  // CRITICAL: redirect() calls must be OUTSIDE try-catch
  redirect(`/boards/${board.id}`);
}
```

### Client-Side Validation

```typescript
// Client-side validation before server action
const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

const validateAndSubmit = async (formData: FormData) => {
  const result = boardSchema.safeParse({
    name: formData.get("name"),
  });

  if (!result.success) {
    const errors = result.error.errors.reduce((acc, error) => {
      acc[error.path[0]] = error.message;
      return acc;
    }, {} as Record<string, string>);

    setClientErrors(errors);
    return;
  }

  setClientErrors({});
  // Proceed with server action
  await serverAction(formData);
};
```

## Error Handling Patterns

### Dual Error Handling (State + Thrown)

```typescript
// Handle both useActionState results and thrown errors
const [state, formAction] = useActionState(serverAction, { error: null });
const [thrownError, setThrownError] = useState<string | null>(null);

const handleSubmit = async (formData: FormData) => {
  setThrownError(null);

  try {
    await formAction(formData);
  } catch (error) {
    setThrownError(
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

// Display errors from both sources
const displayError = thrownError || state.error;
```

### Error Boundary Integration

```typescript
// Error boundary for server component errors
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-boundary">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Server Action Best Practices

### Consistent Error Handling

```typescript
// Consistent error handling pattern
export async function serverAction(formData: FormData) {
  try {
    // Validation
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }

    // Business logic
    const response = await businessLogic(result.data);

    // Cache revalidation
    revalidatePath("/");
  } catch (error) {
    // Only handle business logic errors in try-catch
    throw new Error("Operation failed");
  }

  // CRITICAL: redirect() calls must be OUTSIDE try-catch
  redirect("/success");
}
```

### Never Wrap redirect() in try-catch

```typescript
// ❌ WRONG: Don't wrap redirect in try-catch
try {
  await businessLogic();
  redirect("/success"); // This will be caught as an error!
} catch (error) {
  // redirect() error will be caught here
}

// ✅ CORRECT: Place redirect outside try-catch
try {
  await businessLogic();
} catch (error) {
  throw new Error("Business logic failed");
}
redirect("/success"); // This will work correctly
```

**CRITICAL: Never wrap redirect() calls in try-catch blocks in server actions**

- redirect() throws a special NEXT_REDIRECT error to interrupt execution (this is normal behavior)
- If caught in try-catch, it appears as a failure even when the operation succeeds
- Always place redirect() calls outside try-catch blocks, after successful operations

## State Management

- Use `useActionState` instead of deprecated `useFormState`
- Leverage `useFormStatus` with new properties (data, method, action)
- Use `nuqs` for URL search param state management
- Avoid unnecessary `useState` and `useEffect`:
  - Use server components for data fetching
  - Use React Server Actions for form handling
  - Use URL search params for shareable state

## Async APIs (React 19)

```typescript
// Always use async versions
const cookieStore = await cookies();
const headersList = await headers();
const { isEnabled } = await draftMode();

// Handle async params in layouts/pages
const params = await props.params;
const searchParams = await props.searchParams;
```

## Data Fetching

- Fetch requests are no longer cached by default in Next.js 15
- Use `cache: 'force-cache'` for specific cached requests
- Implement `fetchCache = 'default-cache'` for layout/page-level caching
- Use proper error boundaries and Suspense

## TypeScript Best Practices

- Use interfaces over types
- Avoid enums; use const maps instead
- Use `satisfies` operator for type validation
- Implement proper type safety and inference
- Use descriptive names with auxiliary verbs (`isLoading`, `hasError`)

## Styling & UI

- Use Tailwind CSS with mobile-first approach
- Implement Shadcn UI and Radix UI components
- Ensure responsive design across breakpoints
- Use CSS variables for theme customization

## Performance & Best Practices

- Implement early returns for better readability
- Use functional and declarative programming patterns
- Follow DRY principle
- Prefix event handlers with "handle" (`handleClick`, `handleSubmit`)
- Implement comprehensive error handling
- Plan for accessibility compliance

## Testing and Validation

### Code Quality

- Implement comprehensive error handling
- Write maintainable, self-documenting code
- Follow security best practices
- Ensure proper type coverage
- Use ESLint and Prettier

### Testing Strategy

- Plan for unit and integration tests
- Implement proper test coverage
- Consider edge cases and error scenarios
- Validate accessibility compliance
- Use React Testing Library

Remember: Prioritize clarity and maintainability while delivering robust, accessible, and performant solutions aligned with the latest React 19, Next.js 15, and Vercel AI SDK features and best practices.

# Next.js 15 (React 19) Rules

## This Project

- The root directory is `trello-app`

## Project Structure

- Use App Router with `page.tsx` files in route directories
- Use kebab-case for directories (`components/auth-form`), PascalCase for component files
- Prefer named exports over default exports: `export function Button() { /* ... */ }`

## Component Architecture

- Favor React Server Components (RSC) by default
- Minimize `'use client'` directives:
  - Only use for interactivity, event handlers, browser APIs
  - Create small client wrappers around interactive elements
  - Wrap in `Suspense` with fallback UI
- Structure components: exports, subcomponents, helpers, types
- **CRITICAL: Server Components cannot pass event handlers to Client Components**
  - If you get an error about passing event handlers from Server to Client Components
  - Add `'use client'` directive to convert the component to a Client Component
  - This commonly happens when Server Components try to pass onClick handlers to Next.js Link components
  - Example fix: Add `'use client'` at the top of the component file

## State Management & Forms

### useActionState (Preferred over useFormState)

```typescript
// CORRECT: Use useActionState for form handling
const [state, formAction] = useActionState(serverAction, {
  success: false,
  error: null,
});

// Handle both thrown errors and returned state
const handleSubmit = async (formData: FormData) => {
  try {
    await formAction(formData);
  } catch (error) {
    // Handle thrown errors (validation, etc.)
    setError(error instanceof Error ? error.message : "An error occurred");
  }
};
```

### useFormStatus for Loading States

```typescript
// Use inside form components to detect submission state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : "Save"}
    </Button>
  );
}
```

### Optimistic Updates with Error Handling

```typescript
// Pattern for optimistic updates with rollback
const [displayValue, setDisplayValue] = useState(initialValue);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleUpdate = async (newValue: string) => {
  // Validate before optimistic update
  if (newValue.trim().length === 0) {
    setError("Value is required");
    return;
  }

  setIsLoading(true);
  setError(null);

  // Optimistic update
  const previousValue = displayValue;
  setDisplayValue(newValue);

  try {
    await updateAction(newValue);
    // Success - optimistic update was correct
  } catch (error) {
    // Rollback optimistic update
    setDisplayValue(previousValue);
    setError(error instanceof Error ? error.message : "Update failed");
  } finally {
    setIsLoading(false);
  }
};
```

## Validation with Zod

### Schema Definition

```typescript
// Define validation schemas
import { z } from "zod";

const boardSchema = z.object({
  name: z
    .string()
    .min(1, "Board name is required")
    .max(50, "Board name must be less than 50 characters")
    .trim(),
});

type BoardInput = z.infer<typeof boardSchema>;
```

### Server Action Validation

```typescript
// Server action with Zod validation
export async function createBoard(formData: FormData) {
  const result = boardSchema.safeParse({
    name: formData.get("name"),
  });

  if (!result.success) {
    // Return validation errors in a consistent format
    throw new Error(result.error.errors[0].message);
  }

  const { name } = result.data;

  try {
    const board = await prisma.board.create({
      data: { name },
    });

    revalidatePath("/");
  } catch (error) {
    throw new Error("Failed to create board");
  }

  // CRITICAL: redirect() calls must be OUTSIDE try-catch
  redirect(`/boards/${board.id}`);
}
```

### Client-Side Validation

```typescript
// Client-side validation before server action
const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

const validateAndSubmit = async (formData: FormData) => {
  const result = boardSchema.safeParse({
    name: formData.get("name"),
  });

  if (!result.success) {
    const errors = result.error.errors.reduce((acc, error) => {
      acc[error.path[0]] = error.message;
      return acc;
    }, {} as Record<string, string>);

    setClientErrors(errors);
    return;
  }

  setClientErrors({});
  // Proceed with server action
  await serverAction(formData);
};
```

## Error Handling Patterns

### Dual Error Handling (State + Thrown)

```typescript
// Handle both useActionState results and thrown errors
const [state, formAction] = useActionState(serverAction, { error: null });
const [thrownError, setThrownError] = useState<string | null>(null);

const handleSubmit = async (formData: FormData) => {
  setThrownError(null);

  try {
    await formAction(formData);
  } catch (error) {
    setThrownError(
      error instanceof Error ? error.message : "An error occurred"
    );
  }
};

// Display errors from both sources
const displayError = thrownError || state.error;
```

### Error Boundary Integration

```typescript
// Error boundary for server component errors
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-boundary">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Server Action Best Practices

### Consistent Error Handling

```typescript
// Consistent error handling pattern
export async function serverAction(formData: FormData) {
  try {
    // Validation
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(result.error.errors[0].message);
    }

    // Business logic
    const response = await businessLogic(result.data);

    // Cache revalidation
    revalidatePath("/");
  } catch (error) {
    // Only handle business logic errors in try-catch
    throw new Error("Operation failed");
  }

  // CRITICAL: redirect() calls must be OUTSIDE try-catch
  redirect("/success");
}
```

### Never Wrap redirect() in try-catch

```typescript
// ❌ WRONG: Don't wrap redirect in try-catch
try {
  await businessLogic();
  redirect("/success"); // This will be caught as an error!
} catch (error) {
  // redirect() error will be caught here
}

// ✅ CORRECT: Place redirect outside try-catch
try {
  await businessLogic();
} catch (error) {
  throw new Error("Business logic failed");
}
redirect("/success"); // This will work correctly
```

**CRITICAL: Never wrap redirect() calls in try-catch blocks in server actions**

- redirect() throws a special NEXT_REDIRECT error to interrupt execution (this is normal behavior)
- If caught in try-catch, it appears as a failure even when the operation succeeds
- Always place redirect() calls outside try-catch blocks, after successful operations

## State Management

- Use `useActionState` instead of deprecated `useFormState`
- Leverage `useFormStatus` with new properties (data, method, action)
- Use `nuqs` for URL search param state management
- Avoid unnecessary `useState` and `useEffect`:
  - Use server components for data fetching
  - Use React Server Actions for form handling
  - Use URL search params for shareable state

## Async APIs (React 19)

```typescript
// Always use async versions
const cookieStore = await cookies();
const headersList = await headers();
const { isEnabled } = await draftMode();

// Handle async params in layouts/pages
const params = await props.params;
const searchParams = await props.searchParams;
```

## Data Fetching

- Fetch requests are no longer cached by default in Next.js 15
- Use `cache: 'force-cache'` for specific cached requests
- Implement `fetchCache = 'default-cache'` for layout/page-level caching
- Use proper error boundaries and Suspense

## TypeScript Best Practices

- Use interfaces over types
- Avoid enums; use const maps instead
- Use `satisfies` operator for type validation
- Implement proper type safety and inference
- Use descriptive names with auxiliary verbs (`isLoading`, `hasError`)

## Styling & UI

- Use Tailwind CSS with mobile-first approach
- Implement Shadcn UI and Radix UI components
- Ensure responsive design across breakpoints
- Use CSS variables for theme customization

## Performance & Best Practices

- Implement early returns for better readability
- Use functional and declarative programming patterns
- Follow DRY principle
- Prefix event handlers with "handle" (`handleClick`, `handleSubmit`)
- Implement comprehensive error handling
- Plan for accessibility compliance

## Testing and Validation

### Code Quality

- Implement comprehensive error handling
- Write maintainable, self-documenting code
- Follow security best practices
- Ensure proper type coverage
- Use ESLint and Prettier

### Testing Strategy

- Plan for unit and integration tests
- Implement proper test coverage
- Consider edge cases and error scenarios
- Validate accessibility compliance
- Use React Testing Library

Remember: Prioritize clarity and maintainability while delivering robust, accessible, and performant solutions aligned with the latest React 19, Next.js 15, and Vercel AI SDK features and best practices.
