import { render, screen, fireEvent } from '@testing-library/react'
import SearchBar from '@/components/SearchBar'

describe('SearchBar', () => {
  it('renders search input with default placeholder', () => {
    render(<SearchBar value="" onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText(/search templates/i)).toBeInTheDocument()
  })

  it('calls onChange when the input changes', () => {
    const onChange = jest.fn()
    render(<SearchBar value="" onChange={onChange} />)

    fireEvent.change(screen.getByPlaceholderText(/search templates/i), {
      target: { value: 'NDA' },
    })
    expect(onChange).toHaveBeenCalledWith('NDA')
  })

  it('displays the provided value', () => {
    render(<SearchBar value="contract" onChange={jest.fn()} />)
    expect(screen.getByPlaceholderText(/search templates/i)).toHaveValue('contract')
  })

  it('supports a custom placeholder', () => {
    render(<SearchBar value="" onChange={jest.fn()} placeholder="Find docs" />)
    expect(screen.getByPlaceholderText('Find docs')).toBeInTheDocument()
  })
})
