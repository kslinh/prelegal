import { render, screen, fireEvent } from '@testing-library/react'
import CategoryFilter from '@/components/CategoryFilter'

const categories = [
  { name: 'non-disclosure', description: 'NDAs' },
  { name: 'services', description: 'Service agreements' },
]

describe('CategoryFilter', () => {
  it('renders an All button and one button per category', () => {
    render(
      <CategoryFilter categories={categories} selected={null} onSelect={jest.fn()} />
    )

    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('Non Disclosure')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
  })

  it('calls onSelect with the category name when a category is clicked', () => {
    const onSelect = jest.fn()
    render(
      <CategoryFilter categories={categories} selected={null} onSelect={onSelect} />
    )

    fireEvent.click(screen.getByText('Non Disclosure'))
    expect(onSelect).toHaveBeenCalledWith('non-disclosure')
  })

  it('calls onSelect with null when All is clicked', () => {
    const onSelect = jest.fn()
    render(
      <CategoryFilter
        categories={categories}
        selected="non-disclosure"
        onSelect={onSelect}
      />
    )

    fireEvent.click(screen.getByText('All'))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('highlights the selected category', () => {
    render(
      <CategoryFilter
        categories={categories}
        selected="non-disclosure"
        onSelect={jest.fn()}
      />
    )

    expect(screen.getByText('Non Disclosure').closest('button')).toHaveClass(
      'bg-indigo-600'
    )
  })
})
