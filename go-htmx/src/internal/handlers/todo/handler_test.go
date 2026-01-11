package todo

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"go/app/src/internal/fields"
	authmw "go/app/src/internal/middleware/auth"
	"go/app/src/internal/repository"
	"go/app/src/internal/services"

	"github.com/go-chi/chi/v5"
)

func setupTestHandler(t *testing.T) (*Handler, *services.TodoService) {
	tmpDir := t.TempDir()
	todosFile := filepath.Join(tmpDir, "todos.json")
	if err := os.WriteFile(todosFile, []byte("[]"), 0644); err != nil {
		t.Fatalf("could not create todos file: %v", err)
	}

	store := repository.NewJSONStore(todosFile)
	repo := repository.NewJSONTodoRepository(store)
	service := services.NewTodoService(repo)
	handler := NewHandler(service)

	return handler, service
}

func addUserToContext(request *http.Request, userID string) *http.Request {
	ctx := context.WithValue(
		request.Context(),
		authmw.UserIDContextKey,
		userID,
	)
	return request.WithContext(ctx)
}

func addChiURLParams(
	request *http.Request,
	params map[string]string,
) *http.Request {
	chiCtx := chi.NewRouteContext()
	for key, value := range params {
		chiCtx.URLParams.Add(key, value)
	}
	ctx := context.WithValue(request.Context(), chi.RouteCtxKey, chiCtx)
	return request.WithContext(ctx)
}

func TestHandler_Create(t *testing.T) {
	testCases := []struct {
		name       string
		title      string
		listID     string
		wantStatus int
	}{
		{
			name:       "successful create",
			title:      "My Todo",
			listID:     "list-1",
			wantStatus: http.StatusOK,
		},
		{
			name:       "empty title returns bad request",
			title:      "",
			listID:     "list-1",
			wantStatus: http.StatusBadRequest,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			handler, _ := setupTestHandler(t)

			form := url.Values{}
			form.Set(fields.TodoTitle, testCase.title)
			form.Set(fields.TodoListID, testCase.listID)

			request := httptest.NewRequest(
				http.MethodPost,
				"/todos",
				strings.NewReader(form.Encode()),
			)
			request.Header.Set(
				"Content-Type",
				"application/x-www-form-urlencoded",
			)
			request = addUserToContext(request, "user-1")

			recorder := httptest.NewRecorder()
			handler.Create(recorder, request)

			if recorder.Code != testCase.wantStatus {
				t.Errorf(
					"Create() status = %d, want %d",
					recorder.Code,
					testCase.wantStatus,
				)
			}

			if testCase.wantStatus == http.StatusOK {
				body := recorder.Body.String()
				if !strings.Contains(body, testCase.title) {
					t.Errorf(
						"Create() body should contain todo title %q",
						testCase.title,
					)
				}
			}
		})
	}
}

func TestHandler_Edit(t *testing.T) {
	testCases := []struct {
		name       string
		setupTodo  bool
		userID     string
		ownerID    string
		wantStatus int
	}{
		{
			name:       "successful edit returns form",
			setupTodo:  true,
			userID:     "user-1",
			ownerID:    "user-1",
			wantStatus: http.StatusOK,
		},
		{
			name:       "non-existent todo returns not found",
			setupTodo:  false,
			userID:     "user-1",
			ownerID:    "",
			wantStatus: http.StatusNotFound,
		},
		{
			name:       "wrong owner returns not found",
			setupTodo:  true,
			userID:     "user-2",
			ownerID:    "user-1",
			wantStatus: http.StatusNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			handler, service := setupTestHandler(t)

			var todoID string
			if testCase.setupTodo {
				todo, err := service.Create(
					context.Background(),
					"Test Todo",
					"Description",
					"list-1",
					testCase.ownerID,
				)
				if err != nil {
					t.Fatalf("could not create test todo: %v", err)
				}
				todoID = todo.ID
			} else {
				todoID = "nonexistent"
			}

			request := httptest.NewRequest(
				http.MethodGet,
				"/todos/"+todoID+"/edit",
				nil,
			)
			request = addUserToContext(request, testCase.userID)
			request = addChiURLParams(request, map[string]string{"id": todoID})

			recorder := httptest.NewRecorder()
			handler.ShowEdit(recorder, request)

			if recorder.Code != testCase.wantStatus {
				t.Errorf(
					"ShowEdit() status = %d, want %d",
					recorder.Code,
					testCase.wantStatus,
				)
			}

			if testCase.wantStatus == http.StatusOK {
				body := recorder.Body.String()
				if !strings.Contains(body, "input") {
					t.Error("Edit() should return an input element")
				}
			}
		})
	}
}

func TestHandler_Update(t *testing.T) {
	testCases := []struct {
		name        string
		setupTodo   bool
		newTitle    string
		description string
		userID      string
		ownerID     string
		wantStatus  int
	}{
		{
			name:        "successful update",
			setupTodo:   true,
			newTitle:    "Updated Title",
			description: "Updated description",
			userID:      "user-1",
			ownerID:     "user-1",
			wantStatus:  http.StatusOK,
		},
		{
			name:        "empty title returns bad request",
			setupTodo:   true,
			newTitle:    "",
			description: "",
			userID:      "user-1",
			ownerID:     "user-1",
			wantStatus:  http.StatusBadRequest,
		},
		{
			name:        "non-existent todo returns not found",
			setupTodo:   false,
			newTitle:    "Updated",
			description: "",
			userID:      "user-1",
			ownerID:     "",
			wantStatus:  http.StatusNotFound,
		},
		{
			name:        "wrong owner returns not found",
			setupTodo:   true,
			newTitle:    "Updated",
			description: "",
			userID:      "user-2",
			ownerID:     "user-1",
			wantStatus:  http.StatusNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			handler, service := setupTestHandler(t)

			var todoID string
			if testCase.setupTodo {
				todo, err := service.Create(
					context.Background(),
					"Original",
					"Original desc",
					"list-1",
					testCase.ownerID,
				)
				if err != nil {
					t.Fatalf("could not create test todo: %v", err)
				}
				todoID = todo.ID
			} else {
				todoID = "nonexistent"
			}

			form := url.Values{}
			form.Set(fields.TodoTitle, testCase.newTitle)
			form.Set(fields.TodoDescription, testCase.description)

			request := httptest.NewRequest(
				http.MethodPut,
				"/todos/"+todoID,
				strings.NewReader(form.Encode()),
			)
			request.Header.Set(
				"Content-Type",
				"application/x-www-form-urlencoded",
			)
			request = addUserToContext(request, testCase.userID)
			request = addChiURLParams(request, map[string]string{"id": todoID})

			recorder := httptest.NewRecorder()
			handler.Update(recorder, request)

			if recorder.Code != testCase.wantStatus {
				t.Errorf(
					"Update() status = %d, want %d",
					recorder.Code,
					testCase.wantStatus,
				)
			}

			if testCase.wantStatus == http.StatusOK {
				body := recorder.Body.String()
				if !strings.Contains(body, testCase.newTitle) {
					t.Errorf(
						"Update() body should contain new title %q",
						testCase.newTitle,
					)
				}
			}
		})
	}
}

func TestHandler_Delete(t *testing.T) {
	testCases := []struct {
		name       string
		setupTodo  bool
		userID     string
		ownerID    string
		wantStatus int
	}{
		{
			name:       "successful delete",
			setupTodo:  true,
			userID:     "user-1",
			ownerID:    "user-1",
			wantStatus: http.StatusOK,
		},
		{
			name:       "non-existent todo returns not found",
			setupTodo:  false,
			userID:     "user-1",
			ownerID:    "",
			wantStatus: http.StatusNotFound,
		},
		{
			name:       "wrong owner returns not found",
			setupTodo:  true,
			userID:     "user-2",
			ownerID:    "user-1",
			wantStatus: http.StatusNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			handler, service := setupTestHandler(t)

			var todoID string
			if testCase.setupTodo {
				todo, err := service.Create(
					context.Background(),
					"Delete Me",
					"",
					"list-1",
					testCase.ownerID,
				)
				if err != nil {
					t.Fatalf("could not create test todo: %v", err)
				}
				todoID = todo.ID
			} else {
				todoID = "nonexistent"
			}

			request := httptest.NewRequest(
				http.MethodDelete,
				"/todos/"+todoID,
				nil,
			)
			request = addUserToContext(request, testCase.userID)
			request = addChiURLParams(request, map[string]string{"id": todoID})

			recorder := httptest.NewRecorder()
			handler.Delete(recorder, request)

			if recorder.Code != testCase.wantStatus {
				t.Errorf(
					"Delete() status = %d, want %d",
					recorder.Code,
					testCase.wantStatus,
				)
			}

			if testCase.wantStatus == http.StatusOK && testCase.setupTodo {
				_, err := service.GetByID(context.Background(), todoID)
				if err != services.ErrTodoNotFound {
					t.Error("Delete() todo should be removed from storage")
				}
			}
		})
	}
}

func TestHandler_Move(t *testing.T) {
	testCases := []struct {
		name       string
		setupTodo  bool
		newListID  string
		userID     string
		ownerID    string
		wantStatus int
	}{
		{
			name:       "successful move",
			setupTodo:  true,
			newListID:  "list-2",
			userID:     "user-1",
			ownerID:    "user-1",
			wantStatus: http.StatusOK,
		},
		{
			name:       "non-existent todo returns not found",
			setupTodo:  false,
			newListID:  "list-2",
			userID:     "user-1",
			ownerID:    "",
			wantStatus: http.StatusNotFound,
		},
		{
			name:       "wrong owner returns not found",
			setupTodo:  true,
			newListID:  "list-2",
			userID:     "user-2",
			ownerID:    "user-1",
			wantStatus: http.StatusNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			handler, service := setupTestHandler(t)

			var todoID string
			if testCase.setupTodo {
				todo, err := service.Create(
					context.Background(),
					"Move Me",
					"",
					"list-1",
					testCase.ownerID,
				)
				if err != nil {
					t.Fatalf("could not create test todo: %v", err)
				}
				todoID = todo.ID
			} else {
				todoID = "nonexistent"
			}

			form := url.Values{}
			form.Set(fields.TodoListID, testCase.newListID)

			request := httptest.NewRequest(
				http.MethodPost,
				"/todos/"+todoID+"/move",
				strings.NewReader(form.Encode()),
			)
			request.Header.Set(
				"Content-Type",
				"application/x-www-form-urlencoded",
			)
			request = addUserToContext(request, testCase.userID)
			request = addChiURLParams(request, map[string]string{"id": todoID})

			recorder := httptest.NewRecorder()
			handler.Move(recorder, request)

			if recorder.Code != testCase.wantStatus {
				t.Errorf(
					"Move() status = %d, want %d",
					recorder.Code,
					testCase.wantStatus,
				)
			}

			if testCase.wantStatus == http.StatusOK && testCase.setupTodo {
				todo, _ := service.GetByID(context.Background(), todoID)
				if todo.ListID != testCase.newListID {
					t.Errorf(
						"Move() listID = %s, want %s",
						todo.ListID,
						testCase.newListID,
					)
				}
			}
		})
	}
}
