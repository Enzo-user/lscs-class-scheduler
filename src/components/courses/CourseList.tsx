import type { FilteredCourse } from '../../lib/filter'
import type { SelectedSection } from '../../lib/schedule'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { CourseCard } from './CourseCard'

/** Below this many results the section lists open automatically. */
const AUTO_EXPAND_LIMIT = 5

export interface CourseListProps {
  courses: FilteredCourse[]
  /** courseId → sectionId for everything on the schedule. */
  selected: Record<string, string>
  entries: SelectedSection[]
  hasActiveFilters: boolean
  onClearFilters: () => void
  onAdd: (courseId: string, sectionId: string) => void
  onRemove: (courseId: string) => void
}

/**
 * The catalogue as a list of cards. Thirty-odd courses render fine as plain
 * DOM; if the catalogue grew to thousands this is where a windowed list
 * (e.g. @tanstack/react-virtual) would wrap the <ul>.
 */
export function CourseList({
  courses,
  selected,
  entries,
  hasActiveFilters,
  onClearFilters,
  onAdd,
  onRemove,
}: CourseListProps) {
  if (courses.length === 0) {
    return hasActiveFilters ? (
      <EmptyState
        title="No courses match"
        description="Try a different search term or remove some filters."
        action={<Button onClick={onClearFilters}>Clear filters</Button>}
      />
    ) : (
      <EmptyState title="No courses available" description="The catalogue is empty." />
    )
  }

  const defaultExpanded = courses.length <= AUTO_EXPAND_LIMIT

  return (
    <ul className="flex flex-col gap-3">
      {courses.map(({ course, sections }) => (
        <CourseCard
          key={course.id}
          course={course}
          sections={sections}
          selectedSectionId={selected[course.id]}
          entries={entries}
          defaultExpanded={defaultExpanded}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      ))}
    </ul>
  )
}
