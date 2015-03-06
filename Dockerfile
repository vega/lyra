# uwdata/lyra
#
# VERSION           0.0.1

FROM phusion/passenger-full

MAINTAINER Timothy Van Heest <timothy.vanheest@gmail.com>

WORKDIR /var/lyra

COPY *.js /var/lyra/
COPY *.json /var/lyra/
COPY prototypes /var/lyra/prototypes
COPY src /var/lyra/src
COPY tests /var/lyra/tests

RUN /usr/bin/npm install
RUN /usr/bin/npm install -g grunt-cli
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Need to serve on all interfaces
RUN sed -i 's/localhost/0.0.0.0/g' /var/lyra/Gruntfile.js

CMD ["grunt", "serve"]

EXPOSE 8080
