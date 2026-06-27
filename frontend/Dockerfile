FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start Vite dev server on all network interfaces
CMD ["npm", "run", "dev", "--", "--host"]
