import { Skeleton } from "@/components/ui/skeleton";

export default function LeadDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-xl border p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="rounded-xl border p-6 space-y-4">
        <Skeleton className="h-5 w-32" />

        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <Skeleton className="h-12 w-full" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    </div>
  );
}