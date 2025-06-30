FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy backend's package files
COPY backend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the entire backend source code
COPY backend/ ./

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the backend port
EXPOSE 5000

# Health check (optional, can comment if unnecessary)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start backend server
CMD ["npm", "start"]
