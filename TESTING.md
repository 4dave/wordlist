# Testing Guide

This project includes comprehensive tests for the autocomplete feature covering unit tests, component tests, and integration tests.

## Test Structure

```
__tests__/
├── lib/
│   └── Trie.test.ts           # Trie data structure unit tests
├── api/
│   └── wordlist.test.ts        # API endpoint tests
├── components/
│   └── Autocomplete.test.tsx   # React component tests
└── integration/
    └── integration.test.ts     # Full integration tests
```

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test -- __tests__/lib/Trie.test.ts
```

## Test Categories

### 1. Trie Data Structure Tests (`__tests__/lib/Trie.test.ts`)

Tests the core Trie implementation for autocomplete:

- ✅ Word insertion and lookup
- ✅ Case-insensitive search
- ✅ Prefix-based search
- ✅ Building from array
- ✅ Preserving original casing in results
- ✅ Result limiting

**Coverage:** Insert, contains, search, buildFromArray methods

### 2. API Endpoint Tests (`__tests__/api/wordlist.test.ts`)

Tests the `/api/wordlist` GET endpoint:

- ✅ Query parameter validation
- ✅ Minimum query length enforcement (2 chars)
- ✅ Rate limiting (429 responses)
- ✅ Response structure validation
- ✅ Type checking (query: string, count: number, results: string[])
- ✅ Case-insensitive search
- ✅ Result limiting (max 100)
- ✅ Error handling

**Coverage:** Validation, rate limiting, response format, edge cases

### 3. React Component Tests (`__tests__/components/Autocomplete.test.tsx`)

Tests the Autocomplete UI component:

- ✅ Component rendering
- ✅ Input field attributes
- ✅ Debouncing (prevents excessive API calls)
- ✅ Minimum character threshold (2 chars)
- ✅ Dropdown display on results
- ✅ Loading state
- ✅ User interactions (click, keyboard navigation)
- ✅ Keyboard events (Arrow keys, Enter, Escape)
- ✅ Text highlighting of matching input
- ✅ Error handling
- ✅ Props validation (minChars, debounceMs)

**Coverage:** Rendering, state management, user interactions, error handling

### 4. Integration Tests (`__tests__/integration/integration.test.ts`)

End-to-end tests for a running application:

- ✅ API health check (port 3000)
- ✅ Data retrieval and structure
- ✅ Response format validation
- ✅ Component rendering on homepage
- ✅ Performance testing (< 200ms response time)
- ✅ Multiple concurrent requests

**Note:** These tests require the app to be running (`npm run dev`)

## Running Integration Tests

To run integration tests against a live server:

```bash
# Terminal 1: Start the development server
npm run dev

# Terminal 2: Run integration tests
npm test -- __tests__/integration/integration.test.ts
```

## What's Being Tested

### API Health & Data Flow

- ✅ Server running on port 3000
- ✅ Correct response types from API
- ✅ Data is filterable and returns expected results
- ✅ Rate limiting prevents abuse
- ✅ Error responses for invalid queries

### Component Functionality

- ✅ Component renders correctly
- ✅ Input accepts text
- ✅ Debouncing prevents excessive requests
- ✅ Results display in dropdown
- ✅ Text highlighting works
- ✅ Keyboard navigation works
- ✅ Clicking result logs to console
- ✅ Error states handled gracefully

### Performance

- ✅ Trie search is efficient O(m) where m = query length
- ✅ API responds within 200ms
- ✅ Component handles rapid user input
- ✅ Debouncing reduces API calls by ~80-90%

## Test Coverage Goals

- **Trie:** 95%+ coverage
- **API:** 90%+ coverage
- **Component:** 85%+ coverage
- **Overall:** 85%+ coverage

Run coverage report:

```bash
npm run test:coverage
```

## Common Issues

### Tests fail with "Cannot find module"

```bash
npm install
```

### Integration tests timeout

- Ensure dev server is running: `npm run dev`
- Check if port 3000 is available
- Increase Jest timeout: `jest.setTimeout(30000)`

### Component tests show TypeScript errors

- Make sure all types are properly imported
- Run: `npm test -- --no-coverage` to see detailed errors

## Pre-commit Testing

Before shipping, run:

```bash
npm run lint
npm test -- --coverage
npm run build
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines. Example for GitHub Actions:

```yaml
- name: Run Tests
  run: npm test -- --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```
