# Testing Documentation

## Overview

Octant uses a comprehensive testing strategy that includes unit tests, integration tests, and end-to-end tests. The testing framework has been migrated to support async/await patterns and follows modern testing practices.

### Quick info

We use:
- factory patterns to create test data
- fixtures to mock key dependencies (database)
- mocks (async mocks) to simulate external services
  - **Sablier is mocked on API and E2E tests by default- always returns empty list of streams**

API e2e note:
- We use Anvil to simulate the blockchain
- After each test, we DON'T REALLY reset the blockchain state (no rollbacks or anything).
   - This is because this did not really work with subgraphs and if rolledback we would still have old info on subgraph resulting in de-synced state.
   - The only solution to allow epoch forwarding (to correctly simulate effective deposits and budgets) was to reset the chain next block timestamp after each test and mint new block. This way we did not get desync between the chain time and the time of the subgraph and time on the backend.

## Test Structure

### 1. Unit Tests (`/tests/v2`)

Unit tests are organized by module, mirroring the structure of the main application:

```
tests/v2/
├── allocations/
├── deposits/
├── epochs/
├── projects/
├── users/
└── ...
```

Each module's tests include:
- Test cases for business logic
- Mocked external dependencies
- Factory patterns for test data
- Async test implementations

### 2. E2E Tests (`/tests/api_e2e`)

End-to-end tests verify the complete system functionality:

```
tests/api_e2e/
├── test_api_allocations.py
├── test_api_deposits.py
├── test_api_epochs.py
├── test_api_projects.py
└── ...
```

Key features:
- Async test implementation
- Real service interactions
- Complete flow testing
- Environment-specific configurations

### 3. Test Utilities

Common testing utilities and helpers:

- **Factories**: Generate test data
- **Fixtures**: Reusable test components
- **Mocks**: External service simulations
- **Helpers**: Common test functions

## Running Tests

### Basic Test Execution

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/v2/allocations/test_allocations.py

# Run tests with coverage
pytest --cov=v2
```

### Test Categories

```bash
# Run only unit tests
pytest tests/v2

# Run only E2E tests
pytest tests/api_e2e

# Run tests matching a pattern
pytest -k "test_allocations"
```

## Test Data Management

1. Use factory patterns to create test data:
2. Where applicable, use fixtures to create test data
3. Mock external services where applicable

## Best Practices

1. **Test Isolation**
   - Each test should be independent
   - Clean up test data
   - Use transactions where appropriate

2. **Async Testing**
   - Use proper async/await patterns
   - Handle timeouts correctly
   - Use appropriate async fixtures

3. **Mocking**
   - Mock external services
   - Use appropriate mock levels
   - Verify mock interactions

4. **Test Data**
   - Use factories for data creation
   - Keep test data minimal
   - Use meaningful test values

5. **Error Cases**
   - Test error conditions
   - Verify error messages
   - Test edge cases

## Continuous Integration

Tests are automatically run:
- On pull requests
- On merges to main / develop

## Troubleshooting

Common issues and solutions:

1. **Async Test Failures**
   - Check for proper async/await usage
   - Verify event loop handling
   - Check for proper cleanup

2. **Database Issues**
   - Verify transaction handling
   - Check for proper cleanup
   - Verify connection management

3. **External Service Issues**
   - Check mock implementations
   - Verify service availability
   - Check configuration 