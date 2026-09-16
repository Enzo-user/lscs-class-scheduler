import { Skeleton } from '../ui/Skeleton'

/** Placeholder for the schedule panel while the catalogue loads. */
export function ScheduleSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-3 h-16 w-full" />
      <Skeleton className="mt-6 h-[28rem] w-full rounded-lg" />
    </div>
  )
}
