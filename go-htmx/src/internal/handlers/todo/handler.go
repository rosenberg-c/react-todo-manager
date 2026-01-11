package todo

import (
	"errors"
	"log"
	"net/http"

	"go/app/src/internal/fields"
	authmw "go/app/src/internal/middleware/auth"
	"go/app/src/internal/services"
	todocard "go/app/src/templates/features/todo/todo-card"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	todoService *services.TodoService
}

func NewHandler(todoService *services.TodoService) *Handler {
	return &Handler{todoService: todoService}
}

func (handler *Handler) Create(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	userID := authmw.GetUserIDFromContext(ctx)
	title := request.FormValue(fields.TodoTitle)
	description := request.FormValue(fields.TodoDescription)
	listID := request.FormValue(fields.TodoListID)

	if title == "" {
		http.Error(writer, Msg.CreateFailed, http.StatusBadRequest)
		return
	}

	todo, err := handler.todoService.Create(
		ctx,
		title,
		description,
		listID,
		userID,
	)
	if err != nil {
		log.Printf("could not create todo: %v", err)
		http.Error(writer, Msg.CreateFailed, http.StatusInternalServerError)
		return
	}

	todocard.TodoCard(todo).Render(ctx, writer)
}

func (handler *Handler) ShowEdit(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	userID := authmw.GetUserIDFromContext(ctx)
	todoID := chi.URLParam(request, "id")

	todo, err := handler.todoService.GetByID(ctx, todoID)
	if err != nil {
		if errors.Is(err, services.ErrTodoNotFound) {
			http.Error(writer, Msg.NotFound, http.StatusNotFound)
			return
		}
		log.Printf("could not get todo: %v", err)
		http.Error(writer, Msg.NotFound, http.StatusInternalServerError)
		return
	}

	if todo.UserID != userID {
		http.Error(writer, Msg.NotFound, http.StatusNotFound)
		return
	}

	todocard.TodoCardEdit(todo).Render(ctx, writer)
}

func (handler *Handler) Update(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	userID := authmw.GetUserIDFromContext(ctx)
	todoID := chi.URLParam(request, "id")
	title := request.FormValue(fields.TodoTitle)
	description := request.FormValue(fields.TodoDescription)

	if title == "" {
		http.Error(writer, Msg.UpdateFailed, http.StatusBadRequest)
		return
	}

	existing, err := handler.todoService.GetByID(ctx, todoID)
	if err != nil {
		if errors.Is(err, services.ErrTodoNotFound) {
			http.Error(writer, Msg.NotFound, http.StatusNotFound)
			return
		}
		log.Printf("could not get todo: %v", err)
		http.Error(writer, Msg.UpdateFailed, http.StatusInternalServerError)
		return
	}

	if existing.UserID != userID {
		http.Error(writer, Msg.NotFound, http.StatusNotFound)
		return
	}

	todo, err := handler.todoService.Update(ctx, todoID, title, description)
	if err != nil {
		log.Printf("could not update todo: %v", err)
		http.Error(writer, Msg.UpdateFailed, http.StatusInternalServerError)
		return
	}

	todocard.TodoCard(todo).Render(ctx, writer)
}

func (handler *Handler) Delete(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	userID := authmw.GetUserIDFromContext(ctx)
	todoID := chi.URLParam(request, "id")

	existing, err := handler.todoService.GetByID(ctx, todoID)
	if err != nil {
		if errors.Is(err, services.ErrTodoNotFound) {
			http.Error(writer, Msg.NotFound, http.StatusNotFound)
			return
		}
		log.Printf("could not get todo: %v", err)
		http.Error(writer, Msg.DeleteFailed, http.StatusInternalServerError)
		return
	}

	if existing.UserID != userID {
		http.Error(writer, Msg.NotFound, http.StatusNotFound)
		return
	}

	if err := handler.todoService.Delete(ctx, todoID); err != nil {
		log.Printf("could not delete todo: %v", err)
		http.Error(writer, Msg.DeleteFailed, http.StatusInternalServerError)
		return
	}

	writer.WriteHeader(http.StatusOK)
}

func (handler *Handler) Move(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	userID := authmw.GetUserIDFromContext(ctx)
	todoID := chi.URLParam(request, "id")

	request.ParseForm()
	listID := request.FormValue(fields.TodoListID)

	existing, err := handler.todoService.GetByID(ctx, todoID)
	if err != nil {
		if errors.Is(err, services.ErrTodoNotFound) {
			http.Error(writer, Msg.NotFound, http.StatusNotFound)
			return
		}
		log.Printf("could not get todo: %v", err)
		http.Error(writer, Msg.MoveFailed, http.StatusInternalServerError)
		return
	}

	if existing.UserID != userID {
		http.Error(writer, Msg.NotFound, http.StatusNotFound)
		return
	}

	todo, err := handler.todoService.Move(ctx, todoID, listID)
	if err != nil {
		log.Printf("could not move todo: %v", err)
		http.Error(writer, Msg.MoveFailed, http.StatusInternalServerError)
		return
	}

	todocard.TodoCard(todo).Render(ctx, writer)
}

func (handler *Handler) Reorder(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	userID := authmw.GetUserIDFromContext(ctx)

	if err := request.ParseForm(); err != nil {
		http.Error(writer, Msg.ReorderFailed, http.StatusBadRequest)
		return
	}
	todoIDs := request.Form[fields.TodoIDs]
	if len(todoIDs) == 0 {
		writer.WriteHeader(http.StatusOK)
		return
	}

	for _, todoID := range todoIDs {
		todo, err := handler.todoService.GetByID(ctx, todoID)
		if err != nil {
			if errors.Is(err, services.ErrTodoNotFound) {
				http.Error(writer, Msg.NotFound, http.StatusNotFound)
				return
			}
			log.Printf("could not get todo: %v", err)
			http.Error(
				writer,
				Msg.ReorderFailed,
				http.StatusInternalServerError,
			)
			return
		}
		if todo.UserID != userID {
			http.Error(writer, Msg.NotFound, http.StatusNotFound)
			return
		}
	}

	if err := handler.todoService.Reorder(ctx, todoIDs); err != nil {
		log.Printf("could not reorder todos: %v", err)
		http.Error(writer, Msg.ReorderFailed, http.StatusInternalServerError)
		return
	}

	writer.WriteHeader(http.StatusOK)
}
