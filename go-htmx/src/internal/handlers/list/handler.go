package list

import (
	"errors"
	"log"
	"net/http"
	"sort"

	"go/app/src/internal/fields"
	authmw "go/app/src/internal/middleware/auth"
	"go/app/src/internal/models"
	"go/app/src/internal/services"
	listcolumn "go/app/src/templates/features/list/list-column"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	listService *services.ListService
	todoService *services.TodoService
}

func NewHandler(
	listService *services.ListService,
	todoService *services.TodoService,
) *Handler {
	return &Handler{
		listService: listService,
		todoService: todoService,
	}
}

func (handler *Handler) Create(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	userID := authmw.GetUserIDFromContext(ctx)
	name := request.FormValue(fields.ListName)

	if name == "" {
		http.Error(writer, Msg.CreateFailed, http.StatusBadRequest)
		return
	}

	list, err := handler.listService.Create(ctx, name, userID)
	if err != nil {
		log.Printf("could not create list: %v", err)
		http.Error(writer, Msg.CreateFailed, http.StatusInternalServerError)
		return
	}

	data := listcolumn.ListWithTodos{
		List:   list,
		Todos:  []models.Todo{},
		SortBy: fields.SortPriority,
	}
	listcolumn.ListColumn(data).Render(ctx, writer)
}

func (handler *Handler) ShowEdit(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	userID := authmw.GetUserIDFromContext(ctx)
	listID := chi.URLParam(request, "id")

	list, err := handler.listService.GetByID(ctx, listID)
	if err != nil {
		if errors.Is(err, services.ErrListNotFound) {
			http.Error(writer, Msg.NotFound, http.StatusNotFound)
			return
		}
		log.Printf("could not get list: %v", err)
		http.Error(writer, Msg.NotFound, http.StatusInternalServerError)
		return
	}

	if list.UserID != userID {
		http.Error(writer, Msg.NotFound, http.StatusNotFound)
		return
	}

	listcolumn.ListTitleEdit(list).Render(ctx, writer)
}

func (handler *Handler) Update(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	userID := authmw.GetUserIDFromContext(ctx)
	listID := chi.URLParam(request, "id")
	name := request.FormValue(fields.ListName)

	if name == "" {
		http.Error(writer, Msg.UpdateFailed, http.StatusBadRequest)
		return
	}

	existing, err := handler.listService.GetByID(ctx, listID)
	if err != nil {
		if errors.Is(err, services.ErrListNotFound) {
			http.Error(writer, Msg.NotFound, http.StatusNotFound)
			return
		}
		log.Printf("could not get list: %v", err)
		http.Error(writer, Msg.UpdateFailed, http.StatusInternalServerError)
		return
	}

	if existing.UserID != userID {
		http.Error(writer, Msg.NotFound, http.StatusNotFound)
		return
	}

	list, err := handler.listService.Update(ctx, listID, name)
	if err != nil {
		log.Printf("could not update list: %v", err)
		http.Error(writer, Msg.UpdateFailed, http.StatusInternalServerError)
		return
	}

	todos, err := handler.todoService.GetByListID(ctx, listID)
	if err != nil {
		log.Printf("could not get todos for list: %v", err)
		todos = []models.Todo{}
	}

	sortBy := fields.SortOption(request.URL.Query().Get(fields.SortBy))
	if sortBy == "" {
		sortBy = fields.SortPriority
	}
	sortTodos(todos, sortBy)

	data := listcolumn.ListWithTodos{
		List:   list,
		Todos:  todos,
		SortBy: sortBy,
	}
	listcolumn.ListColumn(data).Render(ctx, writer)
}

func (handler *Handler) Delete(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	userID := authmw.GetUserIDFromContext(ctx)
	listID := chi.URLParam(request, "id")

	existing, err := handler.listService.GetByID(ctx, listID)
	if err != nil {
		if errors.Is(err, services.ErrListNotFound) {
			http.Error(writer, Msg.NotFound, http.StatusNotFound)
			return
		}
		log.Printf("could not get list: %v", err)
		http.Error(writer, Msg.DeleteFailed, http.StatusInternalServerError)
		return
	}

	if existing.UserID != userID {
		http.Error(writer, Msg.NotFound, http.StatusNotFound)
		return
	}

	todos, err := handler.todoService.GetByListID(ctx, listID)
	if err != nil {
		log.Printf("could not check todos for list: %v", err)
		http.Error(writer, Msg.DeleteFailed, http.StatusInternalServerError)
		return
	}

	if len(todos) > 0 {
		http.Error(writer, Msg.ListNotEmpty, http.StatusBadRequest)
		return
	}

	if err := handler.listService.Delete(ctx, listID); err != nil {
		log.Printf("could not delete list: %v", err)
		http.Error(writer, Msg.DeleteFailed, http.StatusInternalServerError)
		return
	}

	writer.WriteHeader(http.StatusOK)
}

func (handler *Handler) Todos(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	userID := authmw.GetUserIDFromContext(ctx)
	listID := chi.URLParam(request, "id")
	sortBy := fields.SortOption(request.URL.Query().Get(fields.SortBy))

	if sortBy == "" {
		sortBy = fields.SortPriority
	}

	list, err := handler.listService.GetByID(ctx, listID)
	if err != nil {
		if errors.Is(err, services.ErrListNotFound) {
			http.Error(writer, Msg.NotFound, http.StatusNotFound)
			return
		}
		log.Printf("could not get list: %v", err)
		http.Error(writer, Msg.NotFound, http.StatusInternalServerError)
		return
	}

	if list.UserID != userID {
		http.Error(writer, Msg.NotFound, http.StatusNotFound)
		return
	}

	todos, err := handler.todoService.GetByListID(ctx, listID)
	if err != nil {
		log.Printf("could not get todos for list: %v", err)
		todos = []models.Todo{}
	}

	sortTodos(todos, sortBy)

	listcolumn.ListTodos(listID, todos, sortBy).
		Render(ctx, writer)
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
