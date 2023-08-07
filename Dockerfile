# Builder Stage
FROM 323230034331.dkr.ecr.us-east-1.amazonaws.com/nodebaseimage:latest AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Final Stage
FROM 323230034331.dkr.ecr.us-east-1.amazonaws.com/nodebaseimage:latest AS production

WORKDIR /usr/src/app

# Copy only the built artifacts and necessary files from builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src
COPY .env .

# Expose the port your server is running on
EXPOSE 3000

# Start the server using the production build
CMD ["node", "dist/src/main.js"]
