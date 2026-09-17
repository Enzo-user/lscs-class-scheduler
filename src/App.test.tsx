import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { ApiError, getCourses } from './api/coursesApi'
import { ScheduleProvider } from './state/ScheduleProvider'
import { saveScheduleState } from './state/scheduleStorage'
import { makeCourse, makeSection, slot } from './test/fixtures'

vi.mock('./api/coursesApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api/coursesApi')>()),
  getCourses: vi.fn(),
}))
const mockedGetCourses = vi.mocked(getCourses)

// A tiny catalogue: CCPROG3 S11 clashes with CSARCH1 S11 (both Mon/Thu 09:15);
// CCPROG3 S12 and CSARCH1 S12 are free of conflicts.
const CATALOGUE = [
  makeCourse({
    id: 'CCPROG3',
    title: 'Object-Oriented Programming',
    sections: [
      makeSection({ id: 'CCPROG3-S11', instructor: 'Juan Dela Cruz' }),
      makeSection({
        id: 'CCPROG3-S12',
        instructor: 'Maria Santos',
        schedule: [slot('Tuesday', '11:00', '12:30')],
      }),
    ],
  }),
  makeCourse({
    id: 'CSARCH1',
    title: 'Computer Organization',
    sections: [
      makeSection({ id: 'CSARCH1-S11', instructor: 'Pedro Reyes' }),
      makeSection({
        id: 'CSARCH1-S12',
        instructor: 'Ana Lim',
        schedule: [slot('Wednesday', '14:30', '16:00')],
      }),
    ],
  }),
  makeCourse({
    id: 'GEETHIC',
    title: 'Ethics',
    sections: [makeSection({ id: 'GEETHIC-S11', schedule: [slot('Friday', '07:30', '09:00')] })],
  }),
]

function renderApp() {
  const user = userEvent.setup()
  render(
    <ScheduleProvider>
      <App />
    </ScheduleProvider>,
  )
  return user
}

/** Waits for the catalogue to render and returns the course browser section. */
async function loadCatalogue() {
  await screen.findByText('Showing 3 of 3 courses')
}

const schedulePanel = () => screen.getByRole('region', { name: 'My schedule' })
const summaryItems = () =>
  within(screen.getByRole('list', { name: 'Selected sections' })).getAllByRole('listitem')

beforeEach(() => {
  localStorage.clear()
  mockedGetCourses.mockReset()
  mockedGetCourses.mockResolvedValue(CATALOGUE)
})

describe('App', () => {
  it('shows a loading skeleton and then the catalogue', async () => {
    renderApp()
    expect(screen.getByText('Loading courses…')).toBeInTheDocument()
    await loadCatalogue()
    expect(screen.getByText('Object-Oriented Programming')).toBeInTheDocument()
    expect(screen.getByText('Computer Organization')).toBeInTheDocument()
    expect(screen.queryByText('Loading courses…')).not.toBeInTheDocument()
  })

  it('narrows the list as the user searches, and can clear the filters', async () => {
    const user = renderApp()
    await loadCatalogue()

    await user.type(screen.getByLabelText('Search courses'), 'santos')
    await screen.findByText('Showing 1 of 3 courses')
    expect(screen.getByText('Object-Oriented Programming')).toBeInTheDocument()
    expect(screen.queryByText('Computer Organization')).not.toBeInTheDocument()
    // Only the matching section is listed for the course.
    expect(screen.getByRole('button', { name: 'Add CCPROG3 S12' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add CCPROG3 S11' })).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Search courses'), ' nomatch')
    await screen.findByText('No courses match')
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    // The list comes back after the debounce; until then the "empty catalogue"
    // state must not flash in place of "No courses match".
    expect(screen.queryByText('No courses available')).not.toBeInTheDocument()
    expect(screen.getByText('No courses match')).toBeInTheDocument()
    await screen.findByText('Showing 3 of 3 courses')
  })

  it('adds a section to the summary and timetable, then removes it', async () => {
    const user = renderApp()
    await loadCatalogue()
    expect(within(schedulePanel()).getByText('No sections yet')).toBeInTheDocument()

    const addButton = screen.getByRole('button', { name: 'Add CCPROG3 S11' })
    await user.click(addButton)
    // The same element now offers Remove, so keyboard focus is not lost.
    expect(addButton).toHaveFocus()
    expect(addButton).toHaveAccessibleName('Remove CCPROG3 S11')

    const panel = schedulePanel()
    expect(summaryItems()).toHaveLength(1)
    expect(summaryItems()[0]).toHaveTextContent('CCPROG3 S11')
    expect(summaryItems()[0]).toHaveTextContent('Juan Dela Cruz')
    expect(summaryItems()[0]).toHaveTextContent('Mon/Thu 9:15–10:45 AM')
    // Two meetings a week → two timetable blocks.
    expect(within(panel).getAllByText('9:15–10:45 AM')).toHaveLength(2)
    expect(screen.getByText('Added CCPROG3 S11')).toBeInTheDocument()
    expect(screen.getByText('S11 added')).toBeInTheDocument()
    // On desktop the list sits under the timetable, so the timetable heading links to it.
    const heading = within(panel).getByRole('heading', { name: 'Selected sections' })
    expect(within(panel).getByRole('link', { name: 'Selected sections (1)' })).toHaveAttribute(
      'href',
      `#${heading.id}`,
    )

    await user.click(within(panel).getByRole('button', { name: 'Remove CCPROG3 S11' }))
    expect(within(panel).getByText('No sections yet')).toBeInTheDocument()
    expect(within(panel).queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByText('9:15–10:45 AM')).not.toBeInTheDocument()
    // The Remove button is gone, so focus lands on the list heading instead of <body>.
    expect(within(panel).getByRole('heading', { name: 'Selected sections' })).toHaveFocus()
  })

  it('switching to another section of the same course replaces the first', async () => {
    const user = renderApp()
    await loadCatalogue()
    await user.click(screen.getByRole('button', { name: 'Add CCPROG3 S11' }))
    await user.click(screen.getByRole('button', { name: 'Switch to this section CCPROG3 S12' }))

    expect(summaryItems()).toHaveLength(1)
    expect(summaryItems()[0]).toHaveTextContent('CCPROG3 S12')
    expect(summaryItems()[0]).not.toHaveTextContent('CCPROG3 S11')
    expect(schedulePanel()).toHaveTextContent('1 course · 3 units')
    expect(screen.getByText('Switched CCPROG3 S12')).toBeInTheDocument()
  })

  it('marks a clashing section as disabled with the reason', async () => {
    const user = renderApp()
    await loadCatalogue()
    await user.click(screen.getByRole('button', { name: 'Add CCPROG3 S11' }))

    const blocked = screen.getByRole('button', { name: 'Add CSARCH1 S11' })
    expect(blocked).toHaveAttribute('aria-disabled', 'true')
    expect(blocked).toHaveAccessibleDescription('Conflicts with CCPROG3 S11')
    await user.click(blocked)
    expect(summaryItems()).toHaveLength(1)
    expect(summaryItems()[0]).not.toHaveTextContent('CSARCH1')

    // A non-clashing section of the same course is still selectable.
    expect(screen.getByRole('button', { name: 'Add CSARCH1 S12' })).not.toHaveAttribute(
      'aria-disabled',
    )
  })

  it('clears the whole schedule after confirming', async () => {
    const user = renderApp()
    await loadCatalogue()
    await user.click(screen.getByRole('button', { name: 'Add GEETHIC S11' }))

    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(summaryItems()[0]).toHaveTextContent('GEETHIC S11')
    expect(screen.getByRole('button', { name: 'Clear all' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Clear all' }))
    await user.click(screen.getByRole('button', { name: 'Yes, clear all' }))
    expect(within(schedulePanel()).getByText('No sections yet')).toBeInTheDocument()
    expect(
      within(schedulePanel()).getByRole('heading', { name: 'Selected sections' }),
    ).toHaveFocus()
  })

  it('flags a restored selection that clashes with another entry', async () => {
    // Only reachable through stale storage: the UI blocks conflicting adds.
    saveScheduleState({ selected: { CCPROG3: 'CCPROG3-S11', CSARCH1: 'CSARCH1-S11' } })
    renderApp()
    await loadCatalogue()

    expect(summaryItems()).toHaveLength(2)
    expect(summaryItems()[0]).toHaveTextContent('Conflicts with CSARCH1 S11')
    expect(summaryItems()[1]).toHaveTextContent('Conflicts with CCPROG3 S11')
  })

  it('collapses and re-expands a course from its header', async () => {
    const user = renderApp()
    await loadCatalogue()
    // With only three results the section lists start open.
    const header = screen.getByRole('button', { name: /^CCPROG3/, expanded: true })
    expect(screen.getByRole('button', { name: 'Add CCPROG3 S11' })).toBeInTheDocument()

    await user.click(header)
    expect(header).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('button', { name: 'Add CCPROG3 S11' })).not.toBeInTheDocument()

    await user.click(header)
    expect(screen.getByRole('button', { name: 'Add CCPROG3 S11' })).toBeInTheDocument()
  })

  it('shows the error state with a working retry', async () => {
    mockedGetCourses.mockRejectedValueOnce(new ApiError('Server exploded', 500))
    const user = renderApp()

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Could not load courses')
    expect(alert).toHaveTextContent('Server exploded')

    await user.click(screen.getByRole('button', { name: 'Retry' }))
    await loadCatalogue()
    expect(mockedGetCourses).toHaveBeenCalledTimes(2)
  })
})
