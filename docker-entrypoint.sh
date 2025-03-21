#!/bin/sh

# Exit on error
set -e

# Function to wait for database to be ready
wait_for_db() {
  echo "Waiting for database to be ready..."
  while ! nc -z db 5432; do
    sleep 1
  done
  echo "Database is ready!"
}

# Wait for database
wait_for_db

# Run database migrations and seed
echo "Running database migrations..."
npx prisma db push

echo "Seeding database..."
npx prisma db seed

# Build the application (now that DB is available)
echo "Building the application..."
npm run build

# Start the application
echo "Starting the application..."
exec "$@"