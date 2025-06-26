# Backend Documentation

## Current State

The backend has been fully migrated from Flask to FastAPI. All new functionality is developed using FastAPI and async patterns. The old Flask implementation is kept under the `/flask` endpoint as a safety measure for the next allocation window, but it's not actively used in production.

## Architecture

### FastAPI Implementation (`/v2`)

The new implementation follows a modular structure where each feature is encapsulated in its own module:

```
v2/
├── allocations/      # Reward allocation logic
├── deposits/         # Deposit management
├── epochs/          # Epoch handling
├── projects/        # Project management
├── users/           # User operations
├── withdrawals/     # Withdrawal processing
└── core/            # Core functionality
```

Each module typically contains:
- `dependencies.py` - FastAPI dependencies
- `repositories.py` - Database access
- `router.py` - API endpoints
- `schemas.py` - Pydantic models
- `service.py` - Business logic
- `socket.py` - WebSocket handlers (if needed)

### Key Components

1. **FastAPI Application**
   - Async request handling
   - Dependency injection
   - OpenAPI documentation
   - WebSocket support

2. **SocketIO Integration**
   - Real-time communication
   - Redis-based manager (optional)
   - Namespace-based organization

3. **Background Processing**
   - APScheduler for scheduled tasks
   - Async task handling
   - Withdrawal confirmations
   - Epoch transitions

4. **Data Layer**
   - SQLAlchemy models (from Flask)
   - Async session management
   - Migration support

## API Structure

### HTTP Endpoints

The API is organized into logical groups:

- `/allocations` - Reward allocation
- `/deposits` - Deposit management
- `/epochs` - Epoch information
- `/projects` - Project operations
- `/users` - User management
- `/withdrawals` - Withdrawal processing

### WebSocket Endpoints

- `/socket.io/` - Main WebSocket endpoint
- Namespace-based organization
- Real-time updates

## Testing

### Test Structure

1. **Unit Tests** (`/tests/v2`)
   - Module-specific tests
   - Async test implementation
   - Factory patterns

2. **E2E Tests** (`/tests/api_e2e`)
   - Complete flow testing
   - Async implementation
   - Real service interactions

### Running Tests

```bash
# Run all tests
pytest

# Run specific test category
pytest tests/v2
pytest tests/api_e2e
```

## Deployment

The application is deployed to multiple environments:

- UAT: [uat-backend.octant.wildland.dev](https://uat-backend.octant.wildland.dev/)
- Master Testing: [master-backend.octant.wildland.dev](https://master-backend.octant.wildland.dev/)
- Release Candidate: [rc-backend.octant.wildland.dev](https://rc-backend.octant.wildland.dev/)
- Production: [backend.mainnet.octant.app](https://backend.mainnet.octant.app/)

## Development Guidelines

1. **New Features**
   - Implement in FastAPI
   - Use async/await patterns
   - Follow module structure
   - Include tests

2. **Code Organization**
   - Keep modules focused
   - Use dependency injection
   - Follow established patterns
   - Document public interfaces

3. **Testing**
   - Write unit tests
   - Include E2E tests
   - Use factories
   - Mock external services

4. **Performance**
   - Use async patterns
   - Implement caching
   - Optimize database queries
   - Monitor resource usage

## Monitoring

- Custom logging
- Performance metrics
- Health checks

## Future Work

1. **Flask Removal**
   - Remove Flask implementation after next allocation window
   - Clean up legacy dependencies
   - Update documentation

2. **Enhancements**
   - Improved monitoring
   - Enhanced caching
   - Better error handling
   - Performance optimization

3. **Documentation**
   - API documentation
   - Architecture diagrams
   - Deployment guides
   - Development guides
