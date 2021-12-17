FROM node:alpine

WORKDIR /app

EXPOSE 8000

COPY package*.json .

RUN npm install

COPY . .

RUN npm run typeorm

CMD ["npm", "start"]