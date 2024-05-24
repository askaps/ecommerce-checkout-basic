# Build Stage
FROM node:16 as builder
WORKDIR /usr/src/app

COPY .env ./
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY .npmrc ./
COPY ./libs ./libs
COPY ./apps/order-service/tsconfig.app.json ./apps/order-service/tsconfig.app.json

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy service codebase
COPY ./apps/order-service/src ./apps/order-service/src

# Build service
RUN yarn run build:order-service


# Final production stage
FROM node:16
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/.env .
COPY --from=builder /usr/src/app/apps ./dist/apps
COPY --from=builder /usr/src/app/libs ./dist/libs
COPY --from=builder /usr/src/app/dist/apps/order-service ./dist/

COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 4000

# Run service
CMD ["sh", "-c", "node ./dist/main.js"]
