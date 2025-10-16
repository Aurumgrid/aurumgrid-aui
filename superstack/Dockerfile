FROM node:18-slim

WORKDIR /app

# Install curl for health checks if needed
RUN apt-get update && apt-get install -y curl

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
