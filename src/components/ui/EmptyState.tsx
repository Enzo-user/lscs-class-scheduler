import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title: string
  description?: string
  /** Optional call to action, usually a Button. */
  action?: ReactNode
}

/** Friendly placeholder for lists and panels that have nothing to show. */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center">
      <p className="font-medium text-gray-800">{title}</p>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
