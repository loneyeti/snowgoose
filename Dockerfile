FROM node:18-alpine

WORKDIR /app

# Install netcat for database connection checking
RUN apk add --no-cache netcat-openbsd

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh

# Generate Prisma client (no need for database connection)
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 3000

# Use the entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]