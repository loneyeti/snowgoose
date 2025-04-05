#!/bin/sh

# Exit on error
set -e

# Ensure proper permissions for Prisma
mkdir -p /app/node_modules/.prisma
chmod -R 777 /app/node_modules/.prisma

# Ensure Next.js cache directory permissions
mkdir -p /app/.next/cache
chmod -R 777 /app/.next/cache

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
# echo "Building the application..."
# npm run build

# Ensure dependencies are up-to-date based on mounted package.json
echo "Ensuring dependencies are up-to-date..."
npm install

# Start the application
echo "Starting the application..."
exec "$@"
