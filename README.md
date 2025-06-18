# Octant

Octant is a community-driven platform for experiments in decentralized governance.

Developed by the [Golem Foundation](https://golem.foundation/) to test various hypotheses around
user control, voter engagement, and community funding, the platform allows for running various
governance experiments in a real-life environment and rewards user participation with ETH.

Documentation is available [here](https://docs.octant.app/).

## Architecture Overview

The backend is built using FastAPI with the following key components:

- **FastAPI Application**: Main application handling HTTP and WebSocket requests
- **SocketIO**: Real-time communication support with optional Redis backend
- **SQLAlchemy**: Database operations and models
- **APScheduler**: Background task processing (used practially only on non-production environments to automate the epoch transitions)

The application has been fully migrated from Flask to FastAPI. The old Flask implementation is kept under the `/flask` endpoint as a safety measure for the next allocation window, but all new development is done in FastAPI.

### Key Features

- Async/await patterns throughout the codebase
- WebSocket support for real-time updates
- Background task processing
- Comprehensive testing suite
- Redis-based SocketIO manager (optional)

## Development Setup

### Prerequisites

- Python 3.8+
- Docker and Docker Compose
- Node.js and Yarn
- gcloud CLI (for Docker image authentication)

### Initial Setup

1. Build the anvil container (requires gcloud authentication or local build):

```bash
yarn localenv:build-anvil
```

2. Build the development images:

```bash
yarn localenv:build-images
```

3. Start the development environment:

```bash
yarn localenv:up
```

4. Stop the environment:

```bash
yarn localenv:down
```

The local environment will be available at:
- [http://octant.localhost:8080](http://octant.localhost:8080)
- [http://localhost:8080](http://localhost:8080)

### Host Configuration

Add the following to your hosts file (`/etc/hosts` or `C:\Windows\system32\drivers\etc\hosts`):

```
127.0.0.1 octant.localhost
127.0.0.1 rpc.octant.localhost
127.0.0.1 graph.octant.localhost
127.0.0.1 backend.octant.localhost
127.0.0.1 client.octant.localhost
```

### Web Client Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Copy the environment template:
```bash
cp .env.localenv-template .env
```

3. Start the development server:
```bash
yarn dev
```

The client will be available at [http://octant.localhost:5173](http://octant.localhost:5173)

## Testing

The project includes comprehensive test coverage:

- Unit tests in `/tests/v2`
- E2E API tests in `/tests/api_e2e`
- Test utilities and factories

Run tests using:
```bash
pytest
```

## Docker Image Authentication

### gcloud Authentication

Configure Docker to use gcloud authentication:

```bash
gcloud auth configure-docker europe-docker.pkg.dev
```

### Local Anvil Build

If you don't have access to the Golem Foundation image repository, build the anvil image locally:

```bash
git clone https://github.com/golemfoundation/foundry.git --branch=foundry-4129/trace-filter-support --single-branch
cd foundry
docker build -t europe-docker.pkg.dev/wildland-dev/octant-test/foundry:latest .
```

## Contributor Agreement

In order to be able to contribute to any Wildland repository, you will need to agree to the terms of
the [Wildland Contributor Agreement](https://docs.wildland.io/contributor-agreement.html). By
contributing to any such repository, you agree that your contributions will be licensed under
the [GPLv3 License](https://gitlab.com/wildland/governance/octant/-/blob/master/LICENSE).
