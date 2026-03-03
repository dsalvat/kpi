FROM python:3.12-slim AS base

WORKDIR /app

# Copy everything first so pip install . can build the package
COPY . .

RUN pip install --no-cache-dir . && \
    pip install --no-cache-dir psycopg2-binary

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# Dev target with dev dependencies and reload
FROM base AS dev

RUN pip install --no-cache-dir ".[dev]"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
