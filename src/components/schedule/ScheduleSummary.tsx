import { useState } from 'react'
import { courseColorClasses } from '../../lib/courseColor'
import { pluralize } from '../../lib/pluralize'
import { describeSchedule, type SelectedSection } from '../../lib/schedule'
import { formatSchedule } from '../../lib/time'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'

export interface ScheduleSummaryProps {
  entries: SelectedSection[]
  onRemove: (courseId: string) => void
  onClear: () => void
}

/** The selected sections as a readable list with totals and remove/clear actions. */
export function ScheduleSummary({ entries, onRemove, onClear }: ScheduleSummaryProps) {
  // "Clear all" asks once before acting; nothing modal, just a swapped button pair.
  const [confirmingClear, setConfirmingClear] = useState(false)

  if (entries.length === 0) {
    return (
      <EmptyState
        title="No sections yet"
        description="Add sections from the course list to build your schedule."
      />
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-800">{describeSchedule(entries)}</p>
        {confirmingClear ? (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="danger" onClick={() => { onClear(); setConfirmingClear(false) }}>
              Yes, clear all
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmingClear(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirmingClear(true)}>
            Clear all
          </Button>
        )}
      </div>

      <ul aria-label="Selected sections" className="mt-3 flex flex-col gap-2">
        {entries.map(({ course, section }) => (
          <li
            key={section.id}
            className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white p-3"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <span
                aria-hidden="true"
                className={`mt-1 size-3 shrink-0 rounded-full border-2 ${courseColorClasses(course.id)}`}
              />
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-gray-900">
                  {course.code} {section.section}
                  <span className="font-normal text-gray-600"> · {pluralize(course.units, 'unit')}</span>
                </p>
                <p className="text-gray-700">{section.instructor}</p>
                <p className="text-gray-700">
                  {formatSchedule(section.schedule)}
                  <span className="text-gray-500"> · {section.room}</span>
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onRemove(course.id)}>
              Remove{' '}
              <span className="sr-only">
                {course.code} {section.section}
              </span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
