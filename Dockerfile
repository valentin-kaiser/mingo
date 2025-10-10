# syntax=docker/dockerfile:1


FROM node:lts-slim AS frontend

COPY ./application/frontend /app/frontend
WORKDIR /app/frontend

RUN npm install && \
    npm run build

FROM golang:1.25-alpine AS backend

COPY . /app
COPY --from=frontend /app/frontend/public /app/application/backend/static

RUN apk add --no-cache git build-base

WORKDIR /app/application/backend

RUN GIT_TAG=$(git describe --tags || echo "v0.0.0") \
    && GIT_COMMIT=$(git rev-parse HEAD) \
    && GIT_SHORT=$(git rev-parse --short HEAD) \
    && BUILD_TIME=$(date +%FT%T%z) \
    && PACKAGE=github.com/valentin-kaiser/version \
    && go mod tidy \
    && go build -ldflags "-X ${PACKAGE}.GitTag=${GIT_TAG} -X ${PACKAGE}.GitCommit=${GIT_COMMIT} -X ${PACKAGE}.GitShort=${GIT_SHORT} -X ${PACKAGE}.BuildDate=${BUILD_TIME}" -o /mingo main.go

FROM alpine:latest

RUN apk --no-cache add ca-certificates curl \
    && update-ca-certificates

WORKDIR /app
COPY --from=backend /mingo /app/mingo

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "curl", "-f", "http://localhost:8080" ]

EXPOSE 8080/tcp

ENTRYPOINT ["./mingo"]