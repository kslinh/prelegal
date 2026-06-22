import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryFilter } from '@/components/CategoryFilter'

describe('CategoryFilter', () => {
  const mockCategories = [
    'Non-Disclosure',
    'Services',
    'Employment',
    'Commercial',
  ]

  it('renders all category buttons', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory={null}
        onCategoryChange={jest.fn()}
      />
    )

    mockCategories.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument()
    })
  })

  it('calls onCategoryChange when category is clicked', () => {
    const mockOnChange = jest.fn()
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory={null}
        onCategoryChange={mockOnChange}
      />
    )

    const button = screen.getByText('Non-Disclosure')
    fireEvent.click(button)
    expect(mockOnChange).toHaveBeenCalledWith('Non-Disclosure')
  })

  it('highlights selected category', () => {
    const { rerender } = render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory={null}
        onCategoryChange={jest.fn()}
      />
    )

    rerender(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="Non-Disclosure"
        onCategoryChange={jest.fn()}
      />
    )

    const selectedButton = screen.getByText('Non-Disclosure').closest('button')
    expect(selectedButton).toHaveClass('bg-blue-600')
  })

  it('deselects category when clicked again', () => {
    const mockOnChange = jest.fn()
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="Non-Disclosure"
        onCategoryChange={mockOnChange}
      />
    )

    const button = screen.getByText('Non-Disclosure')
    fireEvent.click(button)
    expect(mockOnChange).toHaveBeenCalledWith(null)
  })
})
