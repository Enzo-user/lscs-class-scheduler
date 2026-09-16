export interface AppHeaderProps {
  /** e.g. "3 courses · 9 units"; omitted while the catalogue is loading. */
  summary?: string
}

export function AppHeader({ summary }: AppHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-4 sm:px-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Class Scheduler</h1>
          <p className="text-sm text-gray-600">Browse courses, pick sections and build your weekly timetable.</p>
        </div>
        {summary && <p className="text-sm font-medium text-brand-dark">{summary}</p>}
      </div>
    </header>
  )
}
