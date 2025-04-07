FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm i

EXPOSE 8082

CMD ["npm", "run", "start"]