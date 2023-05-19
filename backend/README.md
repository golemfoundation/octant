# Octant backend server

## Running

### Docker
```
docker-compose up --build
```

### Local

### Prerequisites

This project uses Poetry, you can install it [here](https://python-poetry.org/docs/#installation).

### Setup

Before running shell commands, copy `.env.template` as `.env` and adjust variables. If you want to run server in production setup, set `OCTANT_ENV=production`

Then run the following commands to bootstrap your environment

```bash
poetry install
poetry shell
```

Run the following commands to create your app's
database tables and perform the initial migration

```bash
flask db upgrade
```

Start the server
```bash
python3 startup.py
```

## Test
```bash
pytest
```

## Lint
```bash
black .
```

## Docs
First, Run the server as described above. Then, open a web browser and navigate to the following URL to view documentation:

### HTTP endpoints
http://localhost:5000/
### Websockets
http://localhost:5000/docs/websockets-api
