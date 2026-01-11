package main

import (
	"log"
	"net/http"

	"react-todo-manager/go-htmx/internal/config"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	cfg := config.Load()

	router := chi.NewRouter()

	// Middleware
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(middleware.RequestID)

	// Placeholder until Phase 4/5
	router.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		w.Write([]byte(`<!DOCTYPE html>
<html>
<head><title>Todo Manager</title></head>
<body>
<h1>Go + HTMX Todo Manager</h1>
<p>Hello World</p>
</body>
</html>`))
	})

	log.Printf("Server starting on %s:%s", cfg.Host, cfg.Port)
	if err := http.ListenAndServe(cfg.Host+":"+cfg.Port, router); err != nil {
		log.Fatal(err)
	}
}
