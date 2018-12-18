FROM node:8

EXPOSE 4040

ENV APP_PORT='4040'
ENV APP_NAME='PESUS => inkas:docker'
ENV PG_DB='inkas'
ENV PG_USER='inkas'
ENV PG_HOST='pesus-db'
ENV PG_PASS='desg44'

RUN npm install pm2 @angular/cli -g

RUN useradd -ms /bin/bash -d /usr/inkas inkas
USER inkas

WORKDIR /usr/inkas
RUN git clone https://github.com/aarusso-nyx/pesus-web.git pesus

WORKDIR /usr/inkas/pesus
RUN npm install 

WORKDIR /usr/inkas/pesus/app
RUN npm install 

RUN ng build

WORKDIR /usr/inkas/pesus

CMD ["pm2-runtime", "index.js"]