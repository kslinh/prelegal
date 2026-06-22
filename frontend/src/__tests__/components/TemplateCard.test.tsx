import { render, screen, fireEvent } from '@testing-library/react'
import TemplateCard from '@/components/TemplateCard'
import { TemplateProvider } from '@/context/TemplateContext'

const entry = {
  id: 'nda-001',
  name: 'Non-Disclosure Agreement',
  description: 'Standard NDA template',
  category: 'non-disclosure',
  file: 'nda.json',
  version: '1.0',
}

const renderCard = () =>
  render(
    <TemplateProvider>
      <TemplateCard entry={entry} />
    </TemplateProvider>
  )

describe('TemplateCard', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders template information', () => {
    renderCard()

    expect(screen.getByText('Non-Disclosure Agreement')).toBeInTheDocument()
    expect(screen.getByText('Standard NDA template')).toBeInTheDocument()
    expect(screen.getByText('Non Disclosure')).toBeInTheDocument()
    expect(screen.getByText('v1.0')).toBeInTheDocument()
  })

  it('links to the template detail page', () => {
    renderCard()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/templates/nda-001')
  })

  it('toggles favorite state when the favorite button is clicked', () => {
    renderCard()

    fireEvent.click(screen.getByTitle('Add to favorites'))
    expect(screen.getByTitle('Remove from favorites')).toBeInTheDocument()
  })
})
