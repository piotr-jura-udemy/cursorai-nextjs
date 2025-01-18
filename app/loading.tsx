import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex gap-4 p-4">
      {[1, 2, 3].map((col) => (
        <div key={col} className="w-80">
          <Skeleton className="h-10 w-full mb-4 rounded-lg" />
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((task) => (
              <Skeleton key={task} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
