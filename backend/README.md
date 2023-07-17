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

#### Development
```bash
poetry install
poetry shell
```

#### Production
```bash
poetry install --no-interaction --no-ansi -v --with prod --without dev
poetry shell
```

Run the following commands to create your app's
database tables and perform the initial migration

```bash
flask db upgrade
```

Start the server

#### Development
```bash
python3 startup.py
```

#### Production
```bash
gunicorn -c gunicorn_config.py startup:app
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

### Blockchain info
http://localhost:5000/docs/chain-info


## Scheduler tasks
The app can run background tasks which are handled by [Flask-APScheduler](https://github.com/viniciuschiele/flask-apscheduler).

The scheduler is disabled by default, you can enable it in `.env`:
```
SCHEDULER_ENABLED=True
```

Flask-APScheduler comes with a [build-in API](https://viniciuschiele.github.io/flask-apscheduler/rst/api.html). Enable it by setting:

```
SCHEDULER_API_ENABLED=True
```

