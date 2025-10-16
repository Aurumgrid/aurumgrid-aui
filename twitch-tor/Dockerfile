FROM node:18-slim

# Install Python, pip, and Streamlink
RUN apt-get update && apt-get install -y python3 python3-pip && \
    pip3 install streamlink

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x twitch-hls.sh

CMD ["node", "server.js"]
