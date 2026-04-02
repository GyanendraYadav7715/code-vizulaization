# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build the Vite application for production
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the built assets to the Nginx web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a default nginx configuration if you desire specific routing (Optional)
# For standard Vite apps without complex routing, default nginx config is fine.

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
