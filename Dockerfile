FROM node:21-alpine3.18

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json /app/
COPY . /app/

# Install app dependencies
RUN npm install

EXPOSE 5000
CMD [ "npm", "run", "serve" ]