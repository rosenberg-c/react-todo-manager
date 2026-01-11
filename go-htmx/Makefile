.PHONY: build run dev debug generate clean deps css css-dev css-watch test test-go e2e e2e-ui e2e-headed

# Build the server
build:
	go build -o bin/server ./src/cmd/server

# Run the server
run: build
	./bin/server


# Run with hot reload (builds CSS first)
dev: clean css-dev generate
	air

# Run with debugger (VS Code: attach to localhost:2345)
debug:
	dlv debug ./src/cmd/server --headless --listen=:2345 --api-version=2

# Generate templ files
generate:
	templ generate

# Production CSS: bundled + minified
css:
	npx lightningcss --bundle --minify src/static/css/main.css -o src/static/dist/styles.css

# Development CSS: bundled + sourcemap (no minify)
css-dev:
	npx lightningcss --bundle src/static/css/main.css -o src/static/dist/styles.css --sourcemap

# Watch CSS for changes
css-watch:
	npx lightningcss --bundle src/static/css/main.css -o src/static/dist/styles.css --sourcemap --watch

# Install dependencies
deps:
	go mod download
	go mod tidy

# Install tools
tools:
	go install github.com/a-h/templ/cmd/templ@latest
	go install github.com/air-verse/air@latest
	go install github.com/segmentio/golines@latest
	go install github.com/go-delve/delve/cmd/dlv@latest
	npm install -g prettier
	npm install

# Clean build artifacts
clean:
	rm -rf bin/
	rm -f src/templates/**/*_templ.go

# Format code
fmt:
	golines -w -m 80 --no-reformat-tags src/
	templ fmt src/

# Run all checks
check: generate
	go vet ./...
	go build ./...

# Run all tests (Go + e2e)
test: test-go e2e

# Run Go tests
test-go:
	go test ./...

# Run Playwright e2e tests
e2e:
	npx playwright test

# Run Playwright with UI
e2e-ui:
	npx playwright test --ui

# Run Playwright with visible browser
e2e-headed:
	npx playwright test --headed
