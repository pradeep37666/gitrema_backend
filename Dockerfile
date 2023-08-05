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

# Use the node user from the image
USER node


###################
# BUILD FOR PRODUCTION
###################

FROM 323230034331.dkr.ecr.us-east-1.amazonaws.com/nodebaseimage:latest AS build

WORKDIR /usr/src/app

# Copy package files
COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
COPY .env .

# Run the build command to create the production bundle
RUN npm run build

# Set NODE_ENV environment variable
ENV NODE_ENV production

# Install production dependencies and clean npm cache
RUN npm ci --only=production && npm cache clean --force

USER node


###################
# PRODUCTION
###################

FROM 323230034331.dkr.ecr.us-east-1.amazonaws.com/nodebaseimage:latest AS production

# Copy the bundled code from the build stage
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY .env .

# Expose the port your server is running on
EXPOSE 3000

# Start the server using the production build
CMD ["node", "dist/main.js"]
