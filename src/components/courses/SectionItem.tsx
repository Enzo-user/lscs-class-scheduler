import { memo, useId } from 'react'
import { formatSchedule } from '../../lib/time'
import type { Section } from '../../types/course'
import { Button, type ButtonVariant } from '../ui/Button'

/**
 * How this section relates to the schedule:
 * - `add`: nothing from its course is selected yet
 * - `switch`: a different section of the same course is selected
 * - `selected`: this section is on the schedule
 */
export type SectionState = 'add' | 'switch' | 'selected'

/** What the row's one action button says and looks like in each state. */
const ACTIONS: Record<SectionState, { label: string; variant: ButtonVariant }> = {
  add: { label: 'Add', variant: 'primary' },
  switch: { label: 'Switch to this section', variant: 'secondary' },
  selected: { label: 'Remove', variant: 'ghost' },
}

export interface SectionItemProps {
  courseId: string
  courseCode: string
  section: Section
  state: SectionState
  /** Human-readable list of clashing selections, e.g. "CCPROG3 S11"; empty when none. */
  conflictsWith: string
  onAdd: (courseId: string, sectionId: string) => void
  onRemove: (courseId: string) => void
}

/**
 * One row in a course's section list. Memoised because a catalogue has ~100
 * of these and most of them are untouched by any single add/remove: the
 * props are primitives, stable objects and stable callbacks, so only rows
 * whose state or conflict text changed re-render.
 */
export const SectionItem = memo(function SectionItem({
  courseId,
  courseCode,
  section,
  state,
  conflictsWith,
  onAdd,
  onRemove,
}: SectionItemProps) {
  const reasonId = useId()
  const selected = state === 'selected'
  const blocked = conflictsWith !== '' && !selected
  const name = `${courseCode} ${section.section}`
  const action = ACTIONS[state]

  return (
    <li
      className={`flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between ${
        selected ? 'border-brand bg-brand-light' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="min-w-0 text-sm">
        <p className="font-semibold text-gray-900">
          {section.section}
          <span className="font-normal text-gray-600"> · {section.instructor}</span>
        </p>
        <p className="text-gray-700">
          {formatSchedule(section.schedule)}
          <span className="text-gray-500"> · {section.room}</span>
        </p>
        {blocked && (
          <p id={reasonId} className="mt-1 text-xs font-medium text-amber-800">
            <span aria-hidden="true">⚠ </span>
            Conflicts with {conflictsWith}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {selected && (
          <span className="text-sm font-medium text-brand-dark">
            <span aria-hidden="true">✓ </span>Added
          </span>
        )}
        {/* One button that changes label and action, instead of swapping Add for
            Remove: the element survives the state change, so keyboard focus stays
            on it and the toast announces what happened. */}
        <Button
          size="sm"
          variant={action.variant}
          aria-disabled={blocked || undefined}
          aria-describedby={blocked ? reasonId : undefined}
          onClick={() => {
            if (selected) onRemove(courseId)
            else if (!blocked) onAdd(courseId, section.id)
          }}
        >
          {action.label} <span className="sr-only">{name}</span>
        </Button>
      </div>
    </li>
  )
})
