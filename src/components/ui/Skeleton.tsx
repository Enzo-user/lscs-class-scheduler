export interface SkeletonProps {
  /** Size and spacing utilities; the block itself is a neutral grey pill. */
  className?: string
}

/**
 * Loading placeholder. It is decorative (aria-hidden), so callers announce
 * loading separately with a `role="status"` message. The pulse only runs when
 * the user has not asked for reduced motion.
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded bg-gray-200 motion-safe:animate-pulse ${className}`}
    />
  )
}
