# SUMRY Testing Guide

This document provides comprehensive information about the testing infrastructure for the SUMRY IEP Management System.

## Table of Contents

- [Overview](#overview)
- [Unit Testing](#unit-testing)
- [Component Testing](#component-testing)
- [E2E Testing](#e2e-testing)
- [Running Tests](#running-tests)
- [Coverage](#coverage)

## Overview

SUMRY uses a multi-layered testing approach:

- **Unit Tests**: Test individual functions and utilities
- **Component Tests**: Test React components in isolation
- **E2E Tests**: Test complete user workflows

### Test Stack

- **Vitest**: Unit and component testing framework
- **React Testing Library**: React component testing utilities
- **Playwright**: End-to-end testing framework

## Unit Testing

Unit tests are located in `src/lib/data.test.js` and test all utility functions in the data layer.

### Coverage

Current test coverage includes:

- ✅ 36 unit tests for data utilities
- ✅ ID generation (uid)
- ✅ Timestamp creation and formatting
- ✅ Score parsing and calculations
- ✅ Trendline calculation (linear regression)
- ✅ Progress prediction algorithms
- ✅ Status determination (on-track, off-track)
- ✅ Data normalization and validation
- ✅ Store statistics computation
- ✅ localStorage operations

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Example Test

```javascript
describe('parseScore', () => {
  it('parses valid numeric strings', () => {
    expect(parseScore('42')).toBe(42);
    expect(parseScore('3.14')).toBe(3.14);
  });

  it('returns null for invalid scores', () => {
    expect(parseScore('abc')).toBe(null);
  });
});
```

## Component Testing

Component tests verify React components render correctly and handle user interactions.

### Writing Component Tests

```javascript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## E2E Testing

End-to-end tests use Playwright to test complete user workflows in a real browser.

### Test Structure

E2E tests are located in `tests/e2e/` and organized by feature:

- `app.spec.js` - Core app functionality
- `students.spec.js` - Student management (planned)
- `goals.spec.js` - Goal creation and tracking (planned)
- `reports.spec.js` - Report generation (planned)

### Running E2E Tests

```bash
# Install Playwright browsers (one-time setup)
npx playwright install

# Run all E2E tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/e2e/app.spec.js

# Open Playwright UI
npx playwright test --ui

# Generate HTML report
npx playwright show-report
```

### E2E Test Examples

```javascript
test('should load the homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SUMRY/);
});

test('should allow adding a student', async ({ page }) => {
  await page.goto('/');
  await page.click('button:has-text("Add Student")');
  await page.fill('input[name="name"]', 'John Doe');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=John Doe')).toBeVisible();
});
```

## Coverage

### Current Coverage Stats

- **Unit Tests**: 36 tests, 100% pass rate
- **Functions Covered**: 15+ utility functions
- **Branches Covered**: Error handling, edge cases, happy paths

### Coverage Goals

- Unit test coverage: 80%+ for utility functions
- Component coverage: 70%+ for UI components
- E2E coverage: Critical user paths

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open coverage report in browser
open coverage/index.html
```

## Continuous Integration

Tests run automatically on:

- Every commit
- Pull requests
- Before deployment

### CI Configuration

Add to your CI pipeline:

```yaml
- name: Run Tests
  run: |
    npm ci
    npm run test
    npm run playwright test
```

## Writing New Tests

### Checklist

- [ ] Test happy path
- [ ] Test error cases
- [ ] Test edge cases (empty data, null values)
- [ ] Test user interactions
- [ ] Add descriptive test names
- [ ] Keep tests independent
- [ ] Mock external dependencies

### Best Practices

1. **Arrange-Act-Assert Pattern**
```javascript
it('calculates total', () => {
  // Arrange
  const values = [1, 2, 3];
  
  // Act
  const total = sum(values);
  
  // Assert
  expect(total).toBe(6);
});
```

2. **Use Descriptive Names**
```javascript
// Good
it('returns null when score is not a number')

// Bad
it('test score')
```

3. **Test One Thing**
```javascript
// Good
it('parses valid scores');
it('returns null for invalid scores');

// Bad
it('parses scores and handles errors');
```

## Debugging Tests

### Vitest

```bash
# Run with debugger
node --inspect-brk ./node_modules/vitest/vitest.mjs

# Filter specific test
npm test -- -t "test name"
```

### Playwright

```bash
# Run with debugger
npx playwright test --debug

# Trace viewer
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
