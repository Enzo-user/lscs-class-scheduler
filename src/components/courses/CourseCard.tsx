import { memo, useId, useState } from 'react'
import { findConflicts, type SelectedSection } from '../../lib/schedule'
import type { Course, Section } from '../../types/course'
import { Badge } from '../ui/Badge'
import { SectionItem, type SectionState } from './SectionItem'

export interface CourseCardProps {
  course: Course
  /** Sections that passed the search/filters; a subset of `course.sections`. */
  sections: Section[]
  /** Id of this course's selected section, if any. */
  selectedSectionId: string | undefined
  /** Everything on the schedule, for conflict detection. */
  entries: SelectedSection[]
  /** Open the section list without a click; used when only a few courses are shown. */
  defaultExpanded: boolean
  onAdd: (courseId: string, sectionId: string) => void
  onRemove: (courseId: string) => void
}

/**
 * Course header plus a collapsible list of its sections. Memoised so that
 * typing in the search box (which changes only the list) does not re-render
 * cards whose props are unchanged.
 */
export const CourseCard = memo(function CourseCard({
  course,
  sections,
  selectedSectionId,
  entries,
  defaultExpanded,
  onAdd,
  onRemove,
}: CourseCardProps) {
  // `null` means the user has not toggled this card, so the default applies.
  const [expandedOverride, setExpandedOverride] = useState<boolean | null>(null)
  const expanded = expandedOverride ?? defaultExpanded
  const listId = useId()

  const selectedSection = course.sections.find((section) => section.id === selectedSectionId)
  const hiddenCount = course.sections.length - sections.length

  return (
    <li
      className={`rounded-lg border bg-white shadow-xs ${
        selectedSection ? 'border-brand' : 'border-gray-200'
      }`}
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={listId}
        onClick={() => setExpandedOverride(!expanded)}
        className="flex w-full items-start justify-between gap-3 rounded-lg px-4 py-3 text-left hover:bg-gray-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-900">{course.code}</span>
            <Badge>{course.units} {course.units === 1 ? 'unit' : 'units'}</Badge>
            {selectedSection && (
              <Badge tone="brand">
                <span aria-hidden="true">✓</span> {selectedSection.section} added
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-sm text-gray-700">{course.title}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            {course.sections.length} {course.sections.length === 1 ? 'section' : 'sections'}
            {hiddenCount > 0 && ` · ${sections.length} matching`}
          </p>
        </div>
        <span aria-hidden="true" className="mt-1 text-gray-400">
          {expanded ? '▴' : '▾'}
        </span>
      </button>

      <ul id={listId} hidden={!expanded} className="flex flex-col gap-2 border-t border-gray-100 px-4 py-3">
        {sections.map((section) => (
          <SectionItem
            key={section.id}
            courseId={course.id}
            courseCode={course.code}
            section={section}
            state={sectionState(section, selectedSectionId)}
            conflictsWith={describeConflicts({ course, section }, entries)}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        ))}
      </ul>
    </li>
  )
})

function sectionState(section: Section, selectedSectionId: string | undefined): SectionState {
  if (selectedSectionId === undefined) return 'add'
  return selectedSectionId === section.id ? 'selected' : 'switch'
}

/** "CCPROG3 S11, CSARCH1 S12" for the selections that clash with `candidate`. */
function describeConflicts(candidate: SelectedSection, entries: SelectedSection[]): string {
  return findConflicts(candidate, entries)
    .map((entry) => `${entry.course.code} ${entry.section.section}`)
    .join(', ')
}
