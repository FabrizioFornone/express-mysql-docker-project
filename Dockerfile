FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

COPY init_script.sh ./
RUN chmod +x ./init_script.sh

RUN npm run build

EXPOSE 3000

ENTRYPOINT ["./init_script.sh"]

CMD ["node", "dist/app.js"]
