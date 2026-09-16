import { courseColorClasses } from '../../lib/courseColor'
import type { TimetableBlock as TimetableBlockLayout } from '../../lib/schedule'
import { formatTimeRange } from '../../lib/time'

export interface TimetableBlockProps {
  block: TimetableBlockLayout
}

/** One class meeting on the grid, placed by the rows/column from `buildTimetable`. */
export function TimetableBlock({ block }: TimetableBlockProps) {
  const { course, section, slot } = block
  return (
    <div
      className={`z-10 m-px flex min-w-0 flex-col overflow-hidden rounded border-l-4 px-1.5 py-1 text-[11px] leading-tight ${courseColorClasses(course.id)}`}
      style={{
        // +1 skips the day-header row, which is grid row 1.
        gridRow: `${block.startRow + 1} / ${block.endRow + 1}`,
        gridColumn: block.dayIndex + 2,
      }}
    >
      <p className="font-semibold">
        {course.code} {section.section}
      </p>
      <p>{section.room}</p>
      <p className="opacity-80">{formatTimeRange(slot.startTime, slot.endTime)}</p>
    </div>
  )
}
