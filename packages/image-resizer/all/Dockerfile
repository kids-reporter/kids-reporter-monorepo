FROM node:22.23.4-alpine

RUN corepack enable

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and .yarnrc.yml to the working directory
COPY package*.json .yarnrc.yml ./

# Install the application dependencies
RUN yarn install --immutable

# Copy the rest of the application code to the working directory
COPY . .

# Define the command to run the application
CMD [ "yarn", "start" ]
