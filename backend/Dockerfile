# Image used with local docker-compose for development purposes only
#
# Maintainer:
#   Łukasz Kujawski
FROM --platform=linux/amd64 acidrain/python-poetry:3.11-slim-1.5.1

WORKDIR /app

# Copy the pyproject.toml and poetry.lock files
COPY pyproject.toml poetry.lock ./

# Install dependencies with Poetry
RUN poetry config virtualenvs.create false \
  && poetry install --no-interaction --no-ansi --no-dev

COPY . .

EXPOSE 5000

CMD ["flask", "--app", "startup", "run", "--host", "0.0.0.0"]
