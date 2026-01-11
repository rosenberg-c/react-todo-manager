.PHONY: build run dev generate clean deps

# Build the server
build:
	go build -o bin/server ./src/cmd/server

# Run the server
run: build
	./bin/server

# Run with hot reload
dev:
	air

# Generate templ files
generate:
	templ generate

# Install dependencies
deps:
	go mod download
	go mod tidy

# Install tools
tools:
	go install github.com/a-h/templ/cmd/templ@latest
	go install github.com/air-verse/air@latest

# Clean build artifacts
clean:
	rm -rf bin/
	rm -f templates/**/*_templ.go

# Format code
fmt:
	go fmt ./...
	templ fmt .

# Run all checks
check: generate
	go vet ./...
	go build ./...
