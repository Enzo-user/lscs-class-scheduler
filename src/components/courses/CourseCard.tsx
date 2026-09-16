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
 * App re-renders that do not touch this card (un-debounced keystrokes, toast
 * updates, filter changes that leave its sections intact) skip it. Any add
 * or remove still reaches every card through `entries`, which is what the
 * conflict notes need.
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
        {/* Only phrasing content is valid inside a <button>, hence spans with block/flex rather than div/p. */}
        <span className="block min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-gray-900">{course.code}</span>
            <Badge>{course.units} {course.units === 1 ? 'unit' : 'units'}</Badge>
            {selectedSection && (
              <Badge tone="brand">
                <span aria-hidden="true">✓</span> {selectedSection.section} added
              </Badge>
            )}
          </span>
          <span className="mt-0.5 block text-sm text-gray-700">{course.title}</span>
          <span className="mt-0.5 block text-xs text-gray-500">
            {course.sections.length} {course.sections.length === 1 ? 'section' : 'sections'}
            {hiddenCount > 0 && ` · ${sections.length} matching`}
          </span>
        </span>
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
