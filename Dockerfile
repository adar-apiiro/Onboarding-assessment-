# This file will contain instructions for building your Docker image.

# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of your application code to the container
# This is copying all the application -> -- 
COPY . .

# Expose the port your app will run on
EXPOSE 3000

# Define the command to run your application
CMD ["node", "app.js"]
