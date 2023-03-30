FROM node:16-alpine
WORKDIR /src
COPY package.json .
RUN yarn install --ignore-scripts --frozen-lockfile
COPY . ./
EXPOSE 3000
RUN yarn build
CMD [ "node", "dist/index.js" ]

