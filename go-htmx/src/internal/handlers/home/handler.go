package home

import (
	"log"
	"net/http"
	"sort"

	"go/app/src/internal/fields"
	authmw "go/app/src/internal/middleware/auth"
	"go/app/src/internal/models"
	"go/app/src/internal/routes"
	"go/app/src/internal/services"
	listcolumn "go/app/src/templates/features/list/list-column"
	"go/app/src/templates/pages/home"
)

type Handler struct {
	userService *services.UserService
	listService *services.ListService
	todoService *services.TodoService
}

func NewHandler(
	userService *services.UserService,
	listService *services.ListService,
	todoService *services.TodoService,
) *Handler {
	return &Handler{
		userService: userService,
		listService: listService,
		todoService: todoService,
	}
}

func (handler *Handler) Home(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	userID := authmw.GetUserIDFromContext(ctx)
	sortBy := fields.SortOption(request.URL.Query().Get(fields.SortBy))

	if sortBy == "" {
		sortBy = fields.SortPriority
	}

	user, err := handler.userService.GetByID(ctx, userID)
	if err != nil {
		log.Printf("could not get user: %v", err)
		http.Redirect(writer, request, routes.Login, http.StatusFound)
		return
	}

	lists, err := handler.listService.GetByUserID(ctx, userID)
	if err != nil {
		log.Printf("could not get lists: %v", err)
		lists = []models.List{}
	}

	listsWithTodos := make([]listcolumn.ListWithTodos, len(lists))
	for i, list := range lists {
		todos, err := handler.todoService.GetByListID(ctx, list.ID)
		if err != nil {
			log.Printf("could not get todos for list %s: %v", list.ID, err)
			todos = []models.Todo{}
		}
		sortTodos(todos, sortBy)
		listsWithTodos[i] = listcolumn.ListWithTodos{
			List:   list,
			Todos:  todos,
			SortBy: sortBy,
		}
	}

	home.Page(user.Username, listsWithTodos).Render(ctx, writer)
}

func sortTodos(todos []models.Todo, sortBy fields.SortOption) {
	switch sortBy {
	case fields.SortPriority:
		sort.Slice(todos, func(i, j int) bool {
			return todos[i].Priority < todos[j].Priority
		})
	case fields.SortNewestFirst:
		sort.Slice(todos, func(i, j int) bool {
			return todos[i].CreatedAt.After(todos[j].CreatedAt)
		})
	case fields.SortOldestFirst:
		sort.Slice(todos, func(i, j int) bool {
			return todos[i].CreatedAt.Before(todos[j].CreatedAt)
		})
	case fields.SortTitleAsc:
		sort.Slice(todos, func(i, j int) bool {
			return todos[i].Title < todos[j].Title
		})
	case fields.SortTitleDesc:
		sort.Slice(todos, func(i, j int) bool {
			return todos[i].Title > todos[j].Title
		})
	case fields.SortUpdated:
		sort.Slice(todos, func(i, j int) bool {
			return todos[i].UpdatedAt.After(todos[j].UpdatedAt)
		})
	}
}
