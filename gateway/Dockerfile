FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm i

EXPOSE 4000

CMD ["npm", "run", "start:full"]