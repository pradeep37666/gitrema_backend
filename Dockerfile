###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM 323230034331.dkr.ecr.us-east-1.amazonaws.com/nodebaseimage:latest AS development

# Create app directory
WORKDIR /usr/src/app

# Copy package files and .env
COPY --chown=node:node package*.json ./
COPY .env .

# Install app dependencies using the `npm ci` command
RUN npm ci

# Bundle app source
COPY --chown=node:node . .

# Run the build command to create the production bundle
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Install production dependencies and clean npm cache
RUN npm ci --only=production && npm cache clean --force


###################
# PRODUCTION
###################

FROM 323230034331.dkr.ecr.us-east-1.amazonaws.com/nodebaseimage:latest AS production
COPY .env .
# Copy the bundled code from the build stage
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=development /usr/src/app/dist ./dist

# Expose the port your server is running on
EXPOSE 3000

# Start the server using the production build
CMD ["node", "dist/main.js"]
