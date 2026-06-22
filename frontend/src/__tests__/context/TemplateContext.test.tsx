import { render, screen, fireEvent } from '@testing-library/react'
import { TemplateProvider, useTemplateContext } from '@/context/TemplateContext'

const TestComponent = () => {
  const { state, dispatch } = useTemplateContext()

  return (
    <div>
      <span data-testid="favorite-count">{state.favorites.size}</span>
      <span data-testid="is-favorite">
        {state.favorites.has('nda-001') ? 'yes' : 'no'}
      </span>
      <span data-testid="party-name">
        {state.customizations['nda-001']?.partyName || ''}
      </span>
      <button onClick={() => dispatch({ type: 'TOGGLE_FAVORITE', id: 'nda-001' })}>
        Toggle Favorite
      </button>
      <button
        onClick={() =>
          dispatch({
            type: 'SET_FIELD',
            templateId: 'nda-001',
            fieldName: 'partyName',
            value: 'Acme Corp',
          })
        }
      >
        Set Field
      </button>
    </div>
  )
}

const renderProvider = () =>
  render(
    <TemplateProvider>
      <TestComponent />
    </TemplateProvider>
  )

describe('TemplateContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('provides the initial empty state', () => {
    renderProvider()

    expect(screen.getByTestId('favorite-count')).toHaveTextContent('0')
    expect(screen.getByTestId('is-favorite')).toHaveTextContent('no')
  })

  it('toggles a favorite on and off', () => {
    renderProvider()
    const toggle = screen.getByText('Toggle Favorite')

    fireEvent.click(toggle)
    expect(screen.getByTestId('is-favorite')).toHaveTextContent('yes')
    expect(screen.getByTestId('favorite-count')).toHaveTextContent('1')

    fireEvent.click(toggle)
    expect(screen.getByTestId('is-favorite')).toHaveTextContent('no')
    expect(screen.getByTestId('favorite-count')).toHaveTextContent('0')
  })

  it('sets a customization field for a template', () => {
    renderProvider()

    fireEvent.click(screen.getByText('Set Field'))
    expect(screen.getByTestId('party-name')).toHaveTextContent('Acme Corp')
  })
})
