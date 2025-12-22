# Octant Architecture Documentation

## System Overview

Octant is a decentralized governance platform built with FastAPI, providing both HTTP and WebSocket interfaces for real-time communication. The system is designed to handle user interactions, reward calculations, and project allocations in a decentralized manner.

## Core Components

### 1. FastAPI Application (`/v2`)

The main application is built using FastAPI and is organized into modular components:

- **Routers**: Handle HTTP endpoints for different features
  - Allocations
  - Projects
  - Users
  - Epochs
  - Deposits
  - Withdrawals
  - And more...

- **Dependencies**: FastAPI dependency injection system for:
  - Database sessions
  - Blockchain connections
  - Configuration settings
  - External service clients

- **WebSocket Support**: Real-time communication using SocketIO
  - Redis-based manager for horizontal scaling
  - Namespace-based organization
  - Event-driven architecture

### 2. Background Processing

- **APScheduler**: Handles scheduled tasks (used practically only on non-production environments to automate the epoch transitions)
  - Withdrawal confirmations
  - Epoch transitions

- **Redis Integration**: Optional component for:
  - SocketIO message broker
  - Caching

### 3. Data Layer

- **SQLAlchemy**: Database operations
  - Models from Flask implementation
  - Async session management
  - Migration support

- **External Services**:
  - Blockchain interaction (Web3)
  - Subgraph queries (GraphQL)
    - Octant subgraph (locks, unlocks, withdrawals)
    - Sablier subgraph (streams of funds - raffle winners + giveaway)
  - External APIs
    - UQ Score provided by Gitcoin passport

## Module Structure

Each feature module in `/v2` follows a consistent structure:

```
module/
├── dependencies.py    # FastAPI dependencies - meant to be used as a dependency injection by other modules
├── repositories.py    # Database access - access to the database / queries
├── router.py         # API endpoints - the actual endpoints that are exposed to the client
├── schemas.py        # Pydantic models - the data models that are used in the API
├── service.py        # Business logic - the business logic that is used in the API (if exceeds the scope of the router, it should be moved to a separate module)
└── socket.py         # WebSocket handlers - the WebSocket handlers that are used in the API
```

## Testing Architecture

### 1. Unit Tests (`/tests/v2`)

- Module-specific tests
- Mocked external dependencies
- Factory patterns for test data

### 2. E2E Tests (`/tests/api_e2e`)

- Async test implementation
- Full system integration
- Real service interactions

### 3. Test Utilities

- Test factories
- Mock services
- Common test fixtures

## Deployment

The application is deployed to multiple environments:

- UAT (User Acceptance Testing)
- Master Testing
- Release Candidate
- Production

## Security

- Exception handling middleware
- Input validation using Pydantic
- CORS configuration

## Performance Considerations

- Async/await patterns throughout
- Connection pooling to the database
- Caching strategies (Redis)
- Background task processing (APScheduler)

## Future Considerations

1. Remove Flask implementation after next allocation window - currently available under /flask (After 8th epoch allocation window)
2. Cache more - we should cache more data to reduce the number of queries to the database
