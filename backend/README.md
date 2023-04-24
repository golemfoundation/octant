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
```

Run the following commands to create your app's
database tables and perform the initial migration

```bash
flask db init
flask db migrate
flask db upgrade
```

Start the server
```bash
flask --app startup run
```

## Test
```bash
pytest
```
