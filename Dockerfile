# Configuração descrita na documentação do NestJs

# Use the official Node.js image as the base image
FROM node:24-alpine 

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Expose the application port 
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start:migrate:dev"]

