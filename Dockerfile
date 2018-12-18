FROM node:8

EXPOSE 4040

ENV APP_PORT='4040'
ENV APP_NAME='PESUS => inkas:docker'
ENV PG_DB='inkas'
ENV PG_USER='inkas'
ENV PG_HOST='pesus-db'
ENV PG_PASS='desg44'

RUN useradd -ms /bin/bash -d /usr/inkas inkas
USER inkas

WORKDIR /usr/inkas
RUN git clone https://github.com/aarusso-nyx/pesus.git

WORKDIR /usr/inkas/pesus
RUN npm install 

WORKDIR /usr/inkas/pesus/app
RUN rm -Rf src
RUN git clone https://github.com/aarusso-nyx/pesus-web.git dist

WORKDIR /usr/inkas/pesus

CMD ["node", "index.js"]