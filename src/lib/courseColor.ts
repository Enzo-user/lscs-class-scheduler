/**
 * Tailwind classes for the timetable blocks and schedule swatches. Full class
 * strings are listed (never built by string concatenation) so Tailwind can
 * find them at build time. Every entry uses a pale background with a dark
 * text colour of the same hue, which keeps the block text at AA contrast.
 */
const PALETTE = [
  'bg-sky-100 border-sky-500 text-sky-950',
  'bg-amber-100 border-amber-500 text-amber-950',
  'bg-violet-100 border-violet-500 text-violet-950',
  'bg-rose-100 border-rose-500 text-rose-950',
  'bg-emerald-100 border-emerald-500 text-emerald-950',
  'bg-orange-100 border-orange-500 text-orange-950',
  'bg-teal-100 border-teal-500 text-teal-950',
  'bg-fuchsia-100 border-fuchsia-500 text-fuchsia-950',
] as const

/**
 * Picks a palette entry from a hash of the course id, so a course keeps the
 * same colour regardless of what else is selected or how the list is sorted.
 * Distinct courses can share a colour; the block text always says which is which.
 */
export function courseColorClasses(courseId: string): string {
  let hash = 0
  for (const char of courseId) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }
  return PALETTE[hash % PALETTE.length] ?? PALETTE[0]
}
