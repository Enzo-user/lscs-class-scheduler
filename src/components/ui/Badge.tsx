import type { ReactNode } from 'react'

type Tone = 'neutral' | 'brand' | 'warning'

export interface BadgeProps {
  tone?: Tone
  children: ReactNode
}

const TONES: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  brand: 'bg-brand-light text-brand-dark',
  warning: 'bg-amber-100 text-amber-900',
}

/** Small inline label for metadata such as units or "added" status. */
export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  )
}
