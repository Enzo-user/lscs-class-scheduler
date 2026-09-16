import { useId } from 'react'
import { DAYS, abbreviateDay } from '../../lib/time'
import type { Day } from '../../types/course'

export interface CourseFiltersProps {
  days: Day[]
  onToggleDay: (day: Day) => void
  units: number | null
  /** Distinct unit values found in the catalogue, ascending. */
  unitOptions: number[]
  onUnitsChange: (units: number | null) => void
}

/** Day chips (multi-select) and a units dropdown. */
export function CourseFilters({
  days,
  onToggleDay,
  units,
  unitOptions,
  onUnitsChange,
}: CourseFiltersProps) {
  const unitsId = useId()
  const daysId = useId()

  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <fieldset aria-describedby={daysId}>
        <legend className="text-sm font-medium text-gray-700">Meets on</legend>
        <p id={daysId} className="sr-only">
          Show sections that meet on any of the selected days.
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {DAYS.map((day) => {
            const active = days.includes(day)
            return (
              <button
                key={day}
                type="button"
                aria-pressed={active}
                onClick={() => onToggleDay(day)}
                className={`min-h-10 rounded-full border px-3 text-sm font-medium transition-colors sm:min-h-9 ${
                  active
                    ? 'border-brand bg-brand text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
              >
                {abbreviateDay(day)}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor={unitsId} className="block text-sm font-medium text-gray-700">
          Units
        </label>
        <select
          id={unitsId}
          value={units ?? ''}
          onChange={(event) =>
            onUnitsChange(event.target.value === '' ? null : Number(event.target.value))
          }
          className={
            'mt-1 min-h-10 rounded-md border border-gray-300 bg-white px-2 text-sm sm:min-h-9 ' +
            'focus:outline-2 focus:outline-offset-1 focus:outline-brand'
          }
        >
          <option value="">Any</option>
          {unitOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
