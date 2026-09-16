import { useMemo } from 'react'
import { TIMETABLE_RANGE, buildTimetable, type SelectedSection } from '../../lib/schedule'
import { DAYS, abbreviateDay, formatTime } from '../../lib/time'
import { TimetableBlock } from './TimetableBlock'

export interface TimetableProps {
  entries: SelectedSection[]
}

/** One 15-minute grid row in rem, so an hour is 3rem and a 1.5h class is 4.5rem tall. */
const ROW_HEIGHT_REM = 0.75

/**
 * Weekly grid, Monday to Saturday. Column 1 is the time gutter, row 1 the
 * day headers; every other row is 15 minutes. Blocks come pre-positioned
 * from `buildTimetable`, so this component only deals with layout.
 */
export function Timetable({ entries }: TimetableProps) {
  const layout = useMemo(() => buildTimetable(entries, TIMETABLE_RANGE), [entries])

  return (
    <div className="relative">
      <p className="sr-only">
        Weekly timetable from {formatTime(TIMETABLE_RANGE.startTime)} to{' '}
        {formatTime(TIMETABLE_RANGE.endTime)}, Monday to Saturday.
        {entries.length === 0
          ? ' No classes scheduled.'
          : ` ${layout.blocks.length} class meetings are shown; the Selected sections list has the details.`}
      </p>

      {/* The grid keeps a minimum width so blocks stay readable on phones; it scrolls sideways
          inside this box, with the time gutter stuck to the left edge so the hours stay visible. */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <div
          aria-hidden="true"
          className="grid min-w-[40rem]"
          style={{
            gridTemplateColumns: `3.75rem repeat(${DAYS.length}, minmax(0, 1fr))`,
            gridTemplateRows: `auto repeat(${layout.rowCount}, ${ROW_HEIGHT_REM}rem)`,
          }}
        >
          {DAYS.map((day, index) => (
            <div
              key={day}
              className="border-b border-l border-gray-200 py-1.5 text-center text-xs font-semibold text-gray-700"
              style={{ gridRow: 1, gridColumn: index + 2 }}
            >
              {abbreviateDay(day)}
            </div>
          ))}

          <div
            className="sticky left-0 z-20 bg-white"
            style={{ gridRow: `1 / ${layout.rowCount + 2}`, gridColumn: 1 }}
          />
          {layout.hourLabels.map(({ row, label }) => (
            <div key={row} className="contents">
              <div
                className="sticky left-0 z-20 -translate-y-1/2 pr-2 text-right text-[11px] whitespace-nowrap text-gray-500"
                style={{ gridRow: row + 1, gridColumn: 1 }}
              >
                {label}
              </div>
              <div
                className="border-t border-gray-100"
                style={{ gridRow: row + 1, gridColumn: '2 / -1' }}
              />
            </div>
          ))}

          {DAYS.map((day, index) => (
            <div
              key={day}
              className="border-l border-gray-200"
              style={{ gridRow: `2 / ${layout.rowCount + 2}`, gridColumn: index + 2 }}
            />
          ))}

          {layout.blocks.map((block) => (
            <TimetableBlock key={block.key} block={block} />
          ))}
        </div>
      </div>

      {entries.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
          <p className="rounded-md border border-gray-200 bg-white/95 px-4 py-3 text-center text-sm text-gray-600 shadow-xs">
            Your timetable is empty. Added sections will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
