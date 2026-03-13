FROM node:20-slim
RUN apt-get update && apt-get install -y \
    chromium fonts-noto-cjk fonts-wqy-zenhei \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*
ENV CHROME_PATH=/usr/bin/chromium
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
