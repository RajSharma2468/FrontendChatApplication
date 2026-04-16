# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Install serve to run the static build
RUN npm install -g serve

# Copy build output
COPY --from=build /app/build ./build

# Expose port
EXPOSE 3000

# Run serve
CMD ["serve", "-s", "build", "-l", "3000"]