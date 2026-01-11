package main

import (
	"log"
	"net/http"
	"path/filepath"

	"go/app/src/internal/config"
	authHandler "go/app/src/internal/handlers/auth"
	homeHandler "go/app/src/internal/handlers/home"
	listHandler "go/app/src/internal/handlers/list"
	todoHandler "go/app/src/internal/handlers/todo"
	authmw "go/app/src/internal/middleware/auth"
	"go/app/src/internal/repository"
	"go/app/src/internal/routes"
	"go/app/src/internal/services"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
)

func main() {
	cfg := config.Load()

	userStore := repository.NewJSONStore(
		filepath.Join(cfg.DataPath, "users.json"),
	)
	listStore := repository.NewJSONStore(
		filepath.Join(cfg.DataPath, "lists.json"),
	)
	todoStore := repository.NewJSONStore(
		filepath.Join(cfg.DataPath, "todos.json"),
	)

	userRepo := repository.NewJSONUserRepository(userStore)
	listRepo := repository.NewJSONListRepository(listStore)
	todoRepo := repository.NewJSONTodoRepository(todoStore)

	userService := services.NewUserService(userRepo)
	listService := services.NewListService(listRepo)
	todoService := services.NewTodoService(todoRepo)

	authMiddleware := authmw.NewAuthMiddleware(cfg.SessionKey, userService)
	authHandler := authHandler.NewHandler(userService, authMiddleware)
	homeHandler := homeHandler.NewHandler(userService, listService, todoService)
	listHandler := listHandler.NewHandler(listService, todoService)
	todoHandler := todoHandler.NewHandler(todoService)

	router := chi.NewRouter()
	router.Use(chimw.Logger)
	router.Use(chimw.Recoverer)
	router.Use(chimw.RequestID)

	fileServer := http.FileServer(http.Dir("src/static"))
	router.Handle(routes.Static, http.StripPrefix("/static/", fileServer))

	router.Get(
		routes.Health,
		func(writer http.ResponseWriter, request *http.Request) {
			writer.Write([]byte("OK"))
		},
	)

	router.Get(
		routes.Root,
		func(writer http.ResponseWriter, request *http.Request) {
			http.Redirect(writer, request, routes.Login, http.StatusFound)
		},
	)

	router.Group(func(router chi.Router) {
		router.Use(authMiddleware.RedirectIfAuthenticated)

		router.Get(routes.Login, authHandler.ShowLogin)
		router.Post(routes.Login, authHandler.Login)

		router.Get(routes.Register, authHandler.ShowRegister)
		router.Post(routes.Register, authHandler.Register)
	})

	router.Group(func(router chi.Router) {
		router.Use(authMiddleware.RequireAuth)

		router.Get(routes.Home, homeHandler.Home)
		router.Post(routes.Logout, authHandler.Logout)

		router.Get(routes.ListByIDTodos, listHandler.Todos)
		router.Get(routes.ListByIDEdit, listHandler.ShowEdit)
		router.Put(routes.ListByID, listHandler.Update)
		router.Post(routes.Lists, listHandler.Create)
		router.Delete(routes.ListByID, listHandler.Delete)

		router.Get(routes.TodoByIDEdit, todoHandler.ShowEdit)
		router.Post(routes.Todos, todoHandler.Create)
		router.Post(routes.TodosReorder, todoHandler.Reorder)
		router.Put(routes.TodoByID, todoHandler.Update)
		router.Delete(routes.TodoByID, todoHandler.Delete)
		router.Post(routes.TodoByIDMove, todoHandler.Move)
	})

	log.Printf("Server starting on %s:%s", cfg.Host, cfg.Port)
	if err := http.ListenAndServe(cfg.Host+":"+cfg.Port, router); err != nil {
		log.Fatal(err)
	}
}
