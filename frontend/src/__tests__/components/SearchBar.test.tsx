import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from '@/components/SearchBar'

describe('SearchBar', () => {
  it('renders search input', () => {
    const mockOnSearch = jest.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    const input = screen.getByPlaceholderText(/search/i)
    expect(input).toBeInTheDocument()
  })

  it('calls onSearch callback when input changes', () => {
    const mockOnSearch = jest.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement

    fireEvent.change(input, { target: { value: 'NDA' } })
    expect(mockOnSearch).toHaveBeenCalledWith('NDA')
  })

  it('debounces search input', async () => {
    const mockOnSearch = jest.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    const input = screen.getByPlaceholderText(/search/i)

    fireEvent.change(input, { target: { value: 'N' } })
    fireEvent.change(input, { target: { value: 'ND' } })
    fireEvent.change(input, { target: { value: 'NDA' } })

    // Should only call once after debounce timeout
    expect(mockOnSearch).not.toHaveBeenCalled()
  })

  it('clears search on clear button click', () => {
    const mockOnSearch = jest.fn()
    render(<SearchBar onSearch={mockOnSearch} />)
    const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement

    fireEvent.change(input, { target: { value: 'test' } })
    expect(input.value).toBe('test')

    const clearButton = screen.getByRole('button')
    fireEvent.click(clearButton)
    expect(input.value).toBe('')
    expect(mockOnSearch).toHaveBeenCalledWith('')
  })
})
