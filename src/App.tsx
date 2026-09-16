import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CourseFilters } from './components/courses/CourseFilters'
import { CourseList } from './components/courses/CourseList'
import { CourseListSkeleton } from './components/courses/CourseListSkeleton'
import { CourseSearch } from './components/courses/CourseSearch'
import { AppHeader } from './components/layout/AppHeader'
import { AppLayout } from './components/layout/AppLayout'
import { ScheduleSkeleton } from './components/schedule/ScheduleSkeleton'
import { ScheduleSummary } from './components/schedule/ScheduleSummary'
import { Timetable } from './components/schedule/Timetable'
import { ErrorState } from './components/ui/ErrorState'
import { Toast } from './components/ui/Toast'
import { useCourses } from './hooks/useCourses'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useToast } from './hooks/useToast'
import { buildSearchIndex, filterCourses, type FilterState } from './lib/filter'
import { totalUnits } from './lib/schedule'
import { useSchedule } from './state/ScheduleContext'
import { useSelectedSections } from './state/useSelectedSections'
import type { Course, Day } from './types/course'

const SEARCH_DEBOUNCE_MS = 200
/** Stable empty catalogue for the loading/error states, so memo deps do not churn. */
const NO_COURSES: Course[] = []

/**
 * Page-level composition. Owns the search/filter inputs, derives the visible
 * courses, and hands schedule actions (with toast feedback) down to the panes.
 * Must be rendered inside a ScheduleProvider (see main.tsx).
 */
export function App() {
  const courses = useCourses()
  const data = courses.status === 'success' ? courses.data : NO_COURSES

  const [query, setQuery] = useState('')
  const [days, setDays] = useState<Day[]>([])
  const [units, setUnits] = useState<number | null>(null)
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS)

  // Indexed once per catalogue; filtered only when the debounced inputs change.
  const index = useMemo(() => buildSearchIndex(data), [data])
  const filters = useMemo<FilterState>(
    () => ({ query: debouncedQuery, days, units }),
    [debouncedQuery, days, units],
  )
  const visible = useMemo(() => filterCourses(index, filters), [index, filters])
  const unitOptions = useMemo(() => [...new Set(data.map((course) => course.units))].sort((a, b) => a - b), [data])
  // Derived from the debounced `filters`, not the raw query, so the empty
  // state agrees with the list it sits next to during the debounce window.
  const hasActiveFilters = filters.query !== '' || filters.days.length > 0 || filters.units !== null

  const toggleDay = useCallback((day: Day) => {
    setDays((current) => (current.includes(day) ? current.filter((d) => d !== day) : [...current, day]))
  }, [])
  const clearFilters = useCallback(() => {
    setQuery('')
    setDays([])
    setUnits(null)
  }, [])

  const { selected, addSection, removeCourse, clear } = useSchedule()
  const entries = useSelectedSections(data)
  const { toast, showToast } = useToast()

  // handleAdd only needs `selected` to word the toast ("Added" vs "Switched").
  // Reading it through a ref keeps the callback's identity stable across
  // selection changes; otherwise every memoised SectionItem would re-render
  // on each add or remove just because it received a new onAdd.
  const selectedRef = useRef(selected)
  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  const handleAdd = useCallback(
    (courseId: string, sectionId: string) => {
      const course = data.find((c) => c.id === courseId)
      const section = course?.sections.find((s) => s.id === sectionId)
      const replacing = courseId in selectedRef.current
      addSection(courseId, sectionId)
      showToast(`${replacing ? 'Switched' : 'Added'} ${course?.code} ${section?.section}`)
    },
    [data, addSection, showToast],
  )
  const handleRemove = useCallback(
    (courseId: string) => {
      const course = data.find((c) => c.id === courseId)
      removeCourse(courseId)
      showToast(`Removed ${course?.code}`)
    },
    [data, removeCourse, showToast],
  )
  const handleClear = useCallback(() => {
    clear()
    showToast('Cleared your schedule')
  }, [clear, showToast])

  if (courses.status === 'error') {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-xl px-4 py-8">
          <ErrorState message={courses.error.message} onRetry={courses.refetch} />
        </main>
      </>
    )
  }

  const loading = courses.status === 'loading'
  const summary = `${entries.length} ${entries.length === 1 ? 'course' : 'courses'} · ${totalUnits(entries.map((e) => e.course))} units`

  return (
    <>
      <AppHeader summary={loading ? undefined : summary} />
      <AppLayout
        scheduleCount={entries.length}
        browse={
          <div className="flex flex-col gap-4">
            <CourseSearch value={query} onChange={setQuery} resultCount={loading ? null : visible.length} totalCount={data.length} />
            <CourseFilters
              days={days}
              onToggleDay={toggleDay}
              units={units}
              unitOptions={unitOptions}
              onUnitsChange={setUnits}
            />
            {loading ? (
              <CourseListSkeleton />
            ) : (
              <CourseList
                courses={visible}
                selected={selected}
                entries={entries}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                onAdd={handleAdd}
                onRemove={handleRemove}
              />
            )}
          </div>
        }
        schedule={
          loading ? (
            <div className="mt-3">
              <ScheduleSkeleton />
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-6">
              <ScheduleSummary entries={entries} onRemove={handleRemove} onClear={handleClear} />
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-800">Weekly timetable</h3>
                <Timetable entries={entries} />
              </div>
            </div>
          )
        }
      />
      <Toast toast={toast} />
    </>
  )
}
