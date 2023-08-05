# Builder Stage
FROM baseimage AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm i

# Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

# Final Stage
FROM baseimage AS production

WORKDIR /usr/src/app

# Copy only the built artifacts and necessary files from builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY .env .

# Expose the port your server is running on
EXPOSE 3000

# Start the server using the production build
CMD ["node", "dist/main.js"]