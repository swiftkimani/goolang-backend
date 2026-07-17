# golang-backend-boilerplate

> **Fork maintained by [Swift Kimani](https://github.com/swiftkimani)** — originally created by [gemyago](https://github.com/gemyago/golang-backend-boilerplate)

[![Build](https://github.com/swiftkimani/goolang-backend/actions/workflows/build-flow.yml/badge.svg)](https://github.com/swiftkimani/goolang-backend/actions/workflows/build-flow.yml)

Production-ready Go backend boilerplate with CQRS, clean architecture, OpenTelemetry, MCP Server, and a full CRUD API.

## Features

* **CQRS Architecture** — Commands and Queries separated for clean business logic
* **OpenAPI-First API** — Type-safe handlers generated from YAML spec via [apigen](https://github.com/gemyago/apigen)
* **OpenTelemetry** — Distributed tracing, metrics, and structured logging
* **MCP Server** — Model Context Protocol tools over stdio and HTTP
* **SQLite** — Pure-Go driver, zero CGO dependency
* **Layered Architecture** — API → Application → Infrastructure with dependency inversion

## Tech Stack

| Concern | Technology |
|---------|-----------|
| Language | Go 1.26 |
| CLI | [Cobra](https://github.com/spf13/cobra) |
| Config | [Viper](https://github.com/spf13/viper) |
| DI | [uber/dig](https://github.com/uber-go/dig) |
| API Gen | [apigen](https://github.com/gemyago/apigen) |
| Logging | `slog` + [slog-http](https://github.com/samber/slog-http) |
| Testing | [testify](https://github.com/stretchr/testify) + [mockery](https://github.com/vektra/mockery) |
| Tracing | [OpenTelemetry](https://github.com/open-telemetry/opentelemetry-go) |
| MCP | [mcp-go](https://github.com/mark3labs/mcp-go) |
| Watch | [gow](https://github.com/mitranim/gow) |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/swiftkimani/goolang-backend.git
cd goolang-backend

# Install dependencies
go mod download
go install tool

# Run the server
go run ./cmd/server start --env local
```

## Project Structure

```
cmd/
  server/           # HTTP API server entrypoint
  jobs/             # Background jobs runner
  mcp/              # MCP server (stdio + HTTP)

internal/
  api/http/         # HTTP routes, OpenAPI spec, controllers
  api/mcp/          # MCP tools (math, time)
  app/              # Application layer (CQRS commands & queries)
  infrastructure/   # Database, external APIs, HTTP clients
  config/           # Configuration management (Viper)
  di/               # Dependency injection (uber/dig)
  system/           # Time, Identity, Lifecycle utilities
  telemetry/        # OpenTelemetry, pprof, slog
  wireup.go         # Top-level dependency wiring
```

## Development

```bash
# Lint
make lint

# Test
make test

# Run with watch
gow run ./cmd/server/ start --env local
```

## Deployment

```bash
# Docker
make -C build docker/.local-images

# Kubernetes (Helm)
helm upgrade api-service deploy/helm/api-service --install \
  --namespace golang-backend-boilerplate \
  -f deploy/helm/api-service/values.yaml \
  --create-namespace
```

## Credits

This project is a fork of [gemyago/golang-backend-boilerplate](https://github.com/gemyago/golang-backend-boilerplate) — a well-crafted Go backend starter template. All original architecture and patterns are preserved.

Maintained by [Swift Kimani](https://github.com/swiftkimani).

## License

See [LICENSE](./LICENSE) for details.
