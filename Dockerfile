FROM node:18.20.8

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps \
    && npm install @mui/system --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
