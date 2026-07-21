import { Skeleton } from "@/components/ui/skeleton";

export default function LeadDetailSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card-premium p-6 space-y-4">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="card-premium p-6 space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
      <div className="card-premium p-6">
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-9 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
        <div className="card-premium p-6 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
