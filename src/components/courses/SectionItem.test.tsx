import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { makeSection } from '../../test/fixtures'
import { SectionItem, type SectionItemProps } from './SectionItem'

const section = makeSection({ id: 'CCPROG3-S11', instructor: 'Juan Dela Cruz', room: 'G301' })

function renderItem(overrides: Partial<SectionItemProps> = {}) {
  const props: SectionItemProps = {
    courseId: 'CCPROG3',
    courseCode: 'CCPROG3',
    section,
    state: 'add',
    conflictsWith: '',
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    ...overrides,
  }
  render(
    <ul>
      <SectionItem {...props} />
    </ul>,
  )
  return props
}

describe('SectionItem', () => {
  it('shows the section details and an Add button', async () => {
    const { onAdd } = renderItem()
    expect(screen.getByText('Juan Dela Cruz', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Mon/Thu 9:15–10:45 AM')).toBeInTheDocument()
    expect(screen.getByText('G301', { exact: false })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Add CCPROG3 S11' }))
    expect(onAdd).toHaveBeenCalledWith('CCPROG3', 'CCPROG3-S11')
  })

  it('offers to switch when another section of the course is selected', () => {
    renderItem({ state: 'switch' })
    expect(screen.getByRole('button', { name: 'Switch to this section CCPROG3 S11' })).toBeInTheDocument()
  })

  it('shows Added and a Remove button when selected', async () => {
    const { onRemove } = renderItem({ state: 'selected' })
    expect(screen.getByText('Added')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remove CCPROG3 S11' }))
    expect(onRemove).toHaveBeenCalledWith('CCPROG3')
  })

  it('blocks adding a conflicting section and explains why', async () => {
    const { onAdd } = renderItem({ conflictsWith: 'CSARCH1 S12' })
    const button = screen.getByRole('button', { name: 'Add CCPROG3 S11' })
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).toHaveAccessibleDescription('Conflicts with CSARCH1 S12')

    await userEvent.click(button)
    expect(onAdd).not.toHaveBeenCalled()
  })
})
