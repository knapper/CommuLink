# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies for building
RUN npm install

# Copy source code
COPY . .

# Create .env file
RUN sh load_ssm_parameter.sh

# Copy .env file into docker
COPY .env .env

# Build the frontend application
RUN npm run build

# Stage 2: Serve the application with Node.js
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy backend server code
COPY server.js .

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]

