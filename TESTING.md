# Testing Setup

This project has basic unit testing infrastructure set up using Jest and React Testing Library.

## Test Structure

- `src/__tests__/` - Contains all test files
- `src/setupTests.ts` - Jest setup file with global mocks
- `jest.config.mjs` - Jest configuration (ES module format for ES module projects)

## Available Test Scripts

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Basic Test Example

```typescript
// src/__tests__/basic.test.tsx
describe('Basic Testing Setup', () => {
  it('should pass a simple test', () => {
    expect(true).toBe(true);
  });
});
```

## Mocking Strategy

The setup includes mocks for:
- Leaflet library (browser-based mapping)
- React-Leaflet components
- Browser APIs like ResizeObserver and matchMedia

## Adding New Tests

1. Create a new file in `src/__tests__/` with `.test.ts` or `.test.tsx` extension
2. Import the component/service to test
3. Write test cases using Jest syntax
4. Run tests to verify

## Test Coverage
n
Currently includes basic tests for:
- RouteManager service
- Basic functionality verification

## Notes

- Tests use TypeScript and follow the same type safety as the main codebase
- Mock external dependencies to avoid browser-specific issues
- Focus on unit testing individual components and services

## Future Enhancements

- Add more comprehensive tests for key components
- Implement integration tests for complex interactions
- Add end-to-end testing setup if needed
- Set up CI/CD test runs

## Next Steps

To use the testing setup:
1. Run `pnpm install` to install dependencies
2. Run `pnpm test` to execute tests
3. Run `pnpm test:watch` for development
4. Run `pnpm test:coverage` for coverage reports
