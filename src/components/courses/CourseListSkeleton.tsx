import { Skeleton } from '../ui/Skeleton'

const PLACEHOLDER_COUNT = 4

/** Card-shaped placeholders shown while the catalogue loads. */
export function CourseListSkeleton() {
  return (
    <div role="status" className="flex flex-col gap-3">
      <span className="sr-only">Loading courses…</span>
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>
      ))}
    </div>
  )
}
