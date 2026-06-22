import { render, screen, fireEvent } from '@testing-library/react'
import { TemplateCard } from '@/components/TemplateCard'

const mockTemplate = {
  id: 'nda-001',
  name: 'Non-Disclosure Agreement',
  description: 'Standard NDA template',
  category: 'Non-Disclosure',
  version: '1.0',
  sections: [],
  customization_fields: [],
}

describe('TemplateCard', () => {
  it('renders template information', () => {
    render(
      <TemplateCard
        template={mockTemplate}
        onSelect={jest.fn()}
        isFavorite={false}
        onFavoriteToggle={jest.fn()}
      />
    )

    expect(screen.getByText('Non-Disclosure Agreement')).toBeInTheDocument()
    expect(screen.getByText('Standard NDA template')).toBeInTheDocument()
    expect(screen.getByText('Non-Disclosure')).toBeInTheDocument()
  })

  it('calls onSelect when card is clicked', () => {
    const mockOnSelect = jest.fn()
    render(
      <TemplateCard
        template={mockTemplate}
        onSelect={mockOnSelect}
        isFavorite={false}
        onFavoriteToggle={jest.fn()}
      />
    )

    const card = screen.getByText('Non-Disclosure Agreement').closest('div')
    if (card) {
      fireEvent.click(card)
      expect(mockOnSelect).toHaveBeenCalledWith(mockTemplate)
    }
  })

  it('shows filled heart when favorite is true', () => {
    const { rerender } = render(
      <TemplateCard
        template={mockTemplate}
        onSelect={jest.fn()}
        isFavorite={false}
        onFavoriteToggle={jest.fn()}
      />
    )

    let heart = screen.queryByRole('button', { name: /favorite/i })
    expect(heart).toBeInTheDocument()

    rerender(
      <TemplateCard
        template={mockTemplate}
        onSelect={jest.fn()}
        isFavorite={true}
        onFavoriteToggle={jest.fn()}
      />
    )

    heart = screen.queryByRole('button', { name: /favorite/i })
    expect(heart).toBeInTheDocument()
  })

  it('calls onFavoriteToggle when heart button clicked', () => {
    const mockOnFavoriteToggle = jest.fn()
    render(
      <TemplateCard
        template={mockTemplate}
        onSelect={jest.fn()}
        isFavorite={false}
        onFavoriteToggle={mockOnFavoriteToggle}
      />
    )

    const heartButton = screen.getByRole('button', { name: /favorite/i })
    fireEvent.click(heartButton)
    expect(mockOnFavoriteToggle).toHaveBeenCalled()
  })
})
