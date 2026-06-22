import { render, screen, fireEvent } from '@testing-library/react'
import { TemplateProvider, useTemplate } from '@/context/TemplateContext'

const TestComponent = () => {
  const { selectedTemplate, setSelectedTemplate } = useTemplate()

  return (
    <div>
      {selectedTemplate ? (
        <div>
          <span data-testid="template-name">{selectedTemplate.name}</span>
          <button onClick={() => setSelectedTemplate(null)}>Clear</button>
        </div>
      ) : (
        <span data-testid="no-template">No template selected</span>
      )}
      <button
        onClick={() =>
          setSelectedTemplate({
            id: 'nda-001',
            name: 'Test NDA',
            description: 'Test',
            category: 'Non-Disclosure',
            version: '1.0',
            sections: [],
            customization_fields: [],
          })
        }
      >
        Select Template
      </button>
    </div>
  )
}

describe('TemplateContext', () => {
  it('provides initial state', () => {
    render(
      <TemplateProvider>
        <TestComponent />
      </TemplateProvider>
    )

    expect(screen.getByTestId('no-template')).toBeInTheDocument()
  })

  it('updates selected template', () => {
    render(
      <TemplateProvider>
        <TestComponent />
      </TemplateProvider>
    )

    const button = screen.getByText('Select Template')
    fireEvent.click(button)

    expect(screen.getByTestId('template-name')).toBeInTheDocument()
    expect(screen.getByTestId('template-name')).toHaveTextContent('Test NDA')
  })

  it('clears selected template', () => {
    render(
      <TemplateProvider>
        <TestComponent />
      </TemplateProvider>
    )

    fireEvent.click(screen.getByText('Select Template'))
    expect(screen.queryByTestId('template-name')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Clear'))
    expect(screen.getByTestId('no-template')).toBeInTheDocument()
  })
})
