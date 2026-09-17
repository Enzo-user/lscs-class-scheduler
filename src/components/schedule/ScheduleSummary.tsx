import { useRef, useState } from 'react'
import { courseColorClasses } from '../../lib/courseColor'
import { pluralize } from '../../lib/pluralize'
import { describeConflicts, describeSchedule, type SelectedSection } from '../../lib/schedule'
import { formatSchedule } from '../../lib/time'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'

/**
 * Id of the "Selected sections" heading, fixed (not `useId`) so the desktop
 * timetable can link down to the list with a plain fragment link.
 */
export const SELECTED_SECTIONS_ID = 'selected-sections'

export interface ScheduleSummaryProps {
  entries: SelectedSection[]
  onRemove: (courseId: string) => void
  onClear: () => void
}

/** The selected sections as a readable list with totals and remove/clear actions. */
export function ScheduleSummary({ entries, onRemove, onClear }: ScheduleSummaryProps) {
  // "Clear all" asks once before acting: the same button becomes "Yes, clear all"
  // (so focus stays on it) and a Cancel button appears next to it.
  const [confirmingClear, setConfirmingClear] = useState(false)
  // Remove and Clear unmount the button that was pressed, which would drop
  // focus to <body>. Focus moves to the list heading instead, and Cancel hands
  // it back to the Clear all button.
  const headingRef = useRef<HTMLHeadingElement>(null)
  const clearButtonRef = useRef<HTMLButtonElement>(null)

  const handleRemove = (courseId: string) => {
    onRemove(courseId)
    headingRef.current?.focus()
  }
  const handleClear = () => {
    onClear()
    setConfirmingClear(false)
    headingRef.current?.focus()
  }
  const handleCancelClear = () => {
    setConfirmingClear(false)
    clearButtonRef.current?.focus()
  }

  return (
    <div>
      <h3
        id={SELECTED_SECTIONS_ID}
        ref={headingRef}
        tabIndex={-1}
        className="mb-2 rounded text-sm font-semibold text-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Selected sections
      </h3>

      {entries.length === 0 ? (
        <EmptyState
          title="No sections yet"
          description="Add sections from the course list to build your schedule."
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-800">{describeSchedule(entries)}</p>
            <div className="flex items-center gap-2">
              <Button
                ref={clearButtonRef}
                size="sm"
                variant={confirmingClear ? 'danger' : 'ghost'}
                onClick={confirmingClear ? handleClear : () => setConfirmingClear(true)}
              >
                {confirmingClear ? 'Yes, clear all' : 'Clear all'}
              </Button>
              {confirmingClear && (
                <Button size="sm" variant="ghost" onClick={handleCancelClear}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <ul aria-labelledby={SELECTED_SECTIONS_ID} className="mt-3 flex flex-col gap-2">
            {entries.map(({ course, section }) => {
              // Only a stale saved selection can clash (the UI blocks conflicting adds),
              // but when it does the timetable draws the blocks on top of each other,
              // so say so here.
              const conflictsWith = describeConflicts({ course, section }, entries)
              return (
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
                        <span className="font-normal text-gray-600">
                          {' '}
                          · {pluralize(course.units, 'unit')}
                        </span>
                      </p>
                      <p className="text-gray-700">{section.instructor}</p>
                      <p className="text-gray-700">
                        {formatSchedule(section.schedule)}
                        <span className="text-gray-600"> · {section.room}</span>
                      </p>
                      {conflictsWith && (
                        <p className="mt-1 text-xs font-medium text-amber-800">
                          <span aria-hidden="true">⚠ </span>
                          Conflicts with {conflictsWith}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleRemove(course.id)}>
                    Remove{' '}
                    <span className="sr-only">
                      {course.code} {section.section}
                    </span>
                  </Button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
