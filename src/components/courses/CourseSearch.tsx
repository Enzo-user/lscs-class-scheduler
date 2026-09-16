import { useId } from 'react'

export interface CourseSearchProps {
  value: string
  onChange: (value: string) => void
  /** Courses currently shown after search and filters; null while the catalogue is loading. */
  resultCount: number | null
  /** Courses in the whole catalogue. */
  totalCount: number
}

/** Labelled search box with a clear button and a live result count. */
export function CourseSearch({ value, onChange, resultCount, totalCount }: CourseSearchProps) {
  const inputId = useId()

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        Search courses
      </label>
      <div className="relative mt-1">
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Code, title, section or instructor"
          autoComplete="off"
          className="min-h-10 w-full rounded-md border border-gray-300 bg-white px-3 pr-16 text-sm placeholder:text-gray-400 focus:border-brand focus:outline-2 focus:outline-offset-1 focus:outline-brand [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute inset-y-1 right-1 rounded px-2 text-xs font-medium text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-brand"
          >
            Clear
          </button>
        )}
      </div>
      <p role="status" aria-live="polite" className="mt-1 min-h-4 text-xs text-gray-600">
        {resultCount !== null && `Showing ${resultCount} of ${totalCount} courses`}
      </p>
    </div>
  )
}
