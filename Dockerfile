# Stage 1 - Build
FROM node:22-alpine AS build-stage
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# ✅ Define build-time environment variables
ARG VITE_KEYCLOAK_BASE_URL
ARG VITE_API_MAIN_PATH
ARG VITE_APP_BASE_PATH
ARG VITE_APP_TITLE
ARG VITE_API_ENDPOINT
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID
ARG VITE_KEYCLOAK_CLIENT_SECRET

# # # ✅ Pass environment variables into Vite
# ENV VITE_KEYCLOAK_BASE_URL=$VITE_KEYCLOAK_BASE_URL
# ENV VITE_API_MAIN_PATH=$VITE_API_MAIN_PATH
# ENV VITE_APP_BASE_PATH=$VITE_APP_BASE_PATH
# ENV VITE_APP_TITLE=$VITE_APP_TITLE
# ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT
# ENV VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM
# ENV VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID
# ENV VITE_KEYCLOAK_CLIENT_SECRET=$VITE_KEYCLOAK_CLIENT_SECRET

# ENV VITE_KEYCLOAK_BASE_URL="https://ool.kudsonmoo.co/sso"
# ENV VITE_API_MAIN_PATH="https://ool.kudsonmoo.co/apij"
# ENV VITE_APP_BASE_PATH="/tracking"
# ENV VITE_APP_TITLE=$"Hi Girl"
# ENV VITE_API_ENDPOINT="https://ool.kudsonmoo.co/apij"
# ENV VITE_KEYCLOAK_REALM="OOL"
# ENV VITE_KEYCLOAK_CLIENT_ID="gw"
# ENV VITE_KEYCLOAK_CLIENT_SECRET="NNzmkwL1z50fEjauFz2zckxq01N0QQyD"
# # ✅ Ensure .env file is used
# COPY .env .env

# ✅ Build Vite app with environment variables
RUN npm run build

# Stage 2 - Production with Bitnami NGINX
FROM bitnami/nginx:1.27.4
WORKDIR /app

USER root
RUN mkdir -p /app/tracking && chown -R 1001:1001 /app/tracking

USER 1001
COPY --from=build-stage /app/dist /app/tracking
COPY my_server.conf /opt/bitnami/nginx/conf/server_blocks/my_server.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
