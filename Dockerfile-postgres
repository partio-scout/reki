# Postrgres
FROM postgres:11

RUN echo "CREATE USER reki with password 'password'; \
  CREATE DATABASE rekidb; \
  GRANT ALL PRIVILEGES ON DATABASE rekidb TO reki; \
  CREATE DATABASE rekitestdb; \
  GRANT ALL PRIVILEGES ON DATABASE rekitestdb TO reki;" \
  >> /docker-entrypoint-initdb.d/create-db.sql
