import { useState, type ReactNode } from 'react'

type Pane = 'browse' | 'schedule'

export interface AppLayoutProps {
  browse: ReactNode
  schedule: ReactNode
  /** Shown in the mobile "My schedule" tab label. */
  scheduleCount: number
}

/**
 * Two columns from the `lg` breakpoint (browser left, sticky schedule right);
 * below it, a segmented control that sticks to the top of the viewport
 * switches between the two panes, so the schedule is one tap away however far
 * down the list the user is. Both panes stay mounted so switching is instant
 * and scroll/expand state survives.
 */
export function AppLayout({ browse, schedule, scheduleCount }: AppLayoutProps) {
  const [pane, setPane] = useState<Pane>('browse')

  return (
    <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:py-6">
      {/* Negative margins let the sticky bar's background span the page gutters. */}
      <div className="sticky top-0 z-20 -mx-4 -mt-4 mb-2 bg-gray-50 px-4 py-2 sm:-mx-6 sm:px-6 lg:hidden">
        <div className="grid grid-cols-2 rounded-lg border border-gray-300 bg-white p-1">
          <PaneButton active={pane === 'browse'} onClick={() => setPane('browse')}>
            Browse
          </PaneButton>
          <PaneButton active={pane === 'schedule'} onClick={() => setPane('schedule')}>
            My schedule ({scheduleCount})
          </PaneButton>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-6">
        <section
          aria-labelledby="browse-heading"
          className={pane === 'browse' ? '' : 'hidden lg:block'}
        >
          <h2 id="browse-heading" className="sr-only">
            Courses
          </h2>
          {browse}
        </section>

        <section
          aria-labelledby="schedule-heading"
          className={`lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto ${
            pane === 'schedule' ? '' : 'hidden lg:block'
          }`}
        >
          <h2 id="schedule-heading" className="text-lg font-semibold text-gray-900">
            My schedule
          </h2>
          {schedule}
        </section>
      </div>
    </main>
  )
}

interface PaneButtonProps {
  active: boolean
  onClick: () => void
  children: ReactNode
}

function PaneButton({ active, onClick, children }: PaneButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-10 rounded-md text-sm font-medium transition-colors ${
        active ? 'bg-brand text-white' : 'text-gray-700 hover:bg-gray-100'
      } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
    >
      {children}
    </button>
  )
}
