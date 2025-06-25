FROM node:18

RUN mkdir /react

COPY . /react

WORKDIR /react/

RUN npm install -g npm

COPY ./react/package-lock.json /react
COPY ./react/package.json /react

RUN npm install recharts
RUN npm install
RUN npm install react-scripts@3.4.1 -g

CMD ["npm", "start"]