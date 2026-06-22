# Frontend Testing Guide

## Setup

Tests are configured using Jest and React Testing Library. No additional setup needed beyond installing dependencies.

## Installing Dependencies

```bash
cd frontend
npm install
```

This installs:
- `jest` - Testing framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers
- `jest-environment-jsdom` - DOM environment for tests

## Running Tests

### Run all tests once:
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes):
```bash
npm run test:watch
```

### Generate coverage report:
```bash
npm run test:coverage
```

Coverage report will be in `frontend/coverage/` directory.

## Test Structure

Tests are located in `src/__tests__/` directory, organized by component:

```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── components/
│   │   │   ├── SearchBar.test.tsx
│   │   │   ├── TemplateCard.test.tsx
│   │   │   └── CategoryFilter.test.tsx
│   │   └── context/
│   │       └── TemplateContext.test.tsx
│   ├── components/
│   ├── app/
│   └── context/
```

## Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchBar } from '@/components/SearchBar'

describe('SearchBar', () => {
  it('renders search input', () => {
    render(<SearchBar onSearch={jest.fn()} />)
    const input = screen.getByPlaceholderText(/search/i)
    expect(input).toBeInTheDocument()
  })

  it('calls callback on input change', () => {
    const mockFn = jest.fn()
    render(<SearchBar onSearch={mockFn} />)
    const input = screen.getByPlaceholderText(/search/i)
    
    fireEvent.change(input, { target: { value: 'test' } })
    expect(mockFn).toHaveBeenCalledWith('test')
  })
})
```

## What's Tested

### Components
- **SearchBar**: Input, callbacks, clearing
- **TemplateCard**: Rendering, selection, favorites toggle
- **CategoryFilter**: Category rendering, selection, highlighting
- **TemplateGrid**: Grid rendering, filtering, sorting
- **TemplateViewer**: Display, edit mode, downloads

### Context
- **TemplateContext**: State management, updates, clearing

### Utilities
- **templateLoader**: Template loading, caching
- **utils**: Helper functions

## Best Practices

### 1. Use data-testid for Hard-to-Query Elements
```typescript
<div data-testid="template-name">{template.name}</div>

// In test
const element = screen.getByTestId('template-name')
```

### 2. Query by User-Visible Text
```typescript
// Good - queries for visible text
screen.getByText('Submit')
screen.getByPlaceholderText(/search/i)
screen.getByRole('button', { name: /favorite/i })

// Avoid - implementation details
container.querySelector('.template-card')
```

### 3. Test User Interactions
```typescript
fireEvent.click(button)
fireEvent.change(input, { target: { value: 'test' } })
userEvent.type(input, 'test text')  // More realistic
```

### 4. Test Behavior, Not Implementation
```typescript
// Good - tests what user sees
it('shows error message on failure', () => {
  render(<Form onSubmit={mockFn} />)
  fireEvent.click(screen.getByText('Submit'))
  expect(screen.getByText(/error/i)).toBeInTheDocument()
})

// Avoid - tests implementation
it('calls setState', () => {
  // Testing internal state is fragile
})
```

## Common Testing Patterns

### Testing Component Props
```typescript
it('renders with correct props', () => {
  render(<Card title="Test" description="Desc" />)
  expect(screen.getByText('Test')).toBeInTheDocument()
  expect(screen.getByText('Desc')).toBeInTheDocument()
})
```

### Testing Callbacks
```typescript
it('calls callback on interaction', () => {
  const mockFn = jest.fn()
  render(<Button onClick={mockFn} />)
  fireEvent.click(screen.getByRole('button'))
  expect(mockFn).toHaveBeenCalled()
})
```

### Testing Conditional Rendering
```typescript
const { rerender } = render(<Component show={false} />)
expect(screen.queryByText('Content')).not.toBeInTheDocument()

rerender(<Component show={true} />)
expect(screen.getByText('Content')).toBeInTheDocument()
```

### Testing Lists
```typescript
it('renders all items', () => {
  const items = ['Item 1', 'Item 2', 'Item 3']
  render(<List items={items} />)
  items.forEach(item => {
    expect(screen.getByText(item)).toBeInTheDocument()
  })
})
```

### Testing Forms
```typescript
it('submits form with data', () => {
  const mockSubmit = jest.fn()
  render(<Form onSubmit={mockSubmit} />)
  
  fireEvent.change(screen.getByPlaceholderText('Email'), {
    target: { value: 'test@example.com' }
  })
  fireEvent.click(screen.getByText('Submit'))
  
  expect(mockSubmit).toHaveBeenCalledWith({
    email: 'test@example.com'
  })
})
```

## Testing Async Behavior

### With async/await
```typescript
it('loads and displays data', async () => {
  render(<ComponentWithAsyncData />)
  
  // Wait for element to appear
  const element = await screen.findByText('Data Loaded')
  expect(element).toBeInTheDocument()
})
```

### With jest.useFakeTimers
```typescript
it('debounces input', () => {
  jest.useFakeTimers()
  const mockFn = jest.fn()
  render(<SearchBar onSearch={mockFn} />)
  
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } })
  expect(mockFn).not.toHaveBeenCalled()
  
  jest.advanceTimersByTime(500)
  expect(mockFn).toHaveBeenCalled()
  
  jest.useRealTimers()
})
```

## Coverage Targets

Aim for:
- **Statements:** 80%+
- **Branches:** 75%+
- **Functions:** 80%+
- **Lines:** 80%+

Check coverage:
```bash
npm run test:coverage
```

View HTML report:
```bash
open coverage/lcov-report/index.html
```

## Debugging Tests

### See what's rendered
```typescript
const { debug } = render(<Component />)
debug()  // Prints HTML to console
```

### Use screen.logTestingPlaygroundURL()
```typescript
render(<Component />)
screen.logTestingPlaygroundURL()  // Outputs Testing Playground URL
```

### Use screen.getByRole with debugging
```typescript
// Shows all available roles
screen.logTestingPlaygroundURL()
screen.getAllByRole('button')  // List all buttons
```

### Run single test
```bash
npm test -- SearchBar.test.tsx
npm test -- --testNamePattern="renders input"
```

### Run with verbose output
```bash
npm test -- --verbose
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

## Troubleshooting

### "Cannot find module '@/components/SearchBar'"
Make sure `moduleNameMapper` in `jest.config.js` matches `tsconfig.json`:
```js
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

### Tests timeout
Increase timeout:
```typescript
it('slow test', async () => {
  // test code
}, 10000)  // 10 second timeout
```

### Act warnings
Wrap state updates:
```typescript
await act(async () => {
  fireEvent.click(button)
})
```

### Component not updating
Use `waitFor`:
```typescript
import { waitFor } from '@testing-library/react'

await waitFor(() => {
  expect(screen.getByText('Updated')).toBeInTheDocument()
})
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library Docs](https://testing-library.com/react)
- [Testing Playground](https://testing-playground.com/)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Next Steps

1. Run `npm test` to ensure tests pass
2. Add tests for remaining components in `src/components/`
3. Add integration tests for page flows
4. Set up CI/CD to run tests on every push
5. Aim for 80%+ code coverage
