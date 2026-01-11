package list

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

func setupTestHandler(
	t *testing.T,
) (*Handler, *services.ListService, *services.TodoService) {
	tmpDir := t.TempDir()
	listsFile := filepath.Join(tmpDir, "lists.json")
	todosFile := filepath.Join(tmpDir, "todos.json")
	if err := os.WriteFile(listsFile, []byte("[]"), 0644); err != nil {
		t.Fatalf("could not create lists file: %v", err)
	}
	if err := os.WriteFile(todosFile, []byte("[]"), 0644); err != nil {
		t.Fatalf("could not create todos file: %v", err)
	}

	listStore := repository.NewJSONStore(listsFile)
	todoStore := repository.NewJSONStore(todosFile)

	listRepo := repository.NewJSONListRepository(listStore)
	todoRepo := repository.NewJSONTodoRepository(todoStore)
	listService := services.NewListService(listRepo)
	todoService := services.NewTodoService(todoRepo)
	handler := NewHandler(listService, todoService)

	return handler, listService, todoService
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
		listName   string
		wantStatus int
	}{
		{
			name:       "successful create",
			listName:   "My List",
			wantStatus: http.StatusOK,
		},
		{
			name:       "empty name returns bad request",
			listName:   "",
			wantStatus: http.StatusBadRequest,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			handler, _, _ := setupTestHandler(t)

			form := url.Values{}
			form.Set(fields.ListName, testCase.listName)

			request := httptest.NewRequest(
				http.MethodPost,
				"/lists",
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
				if !strings.Contains(body, testCase.listName) {
					t.Errorf(
						"Create() body should contain list name %q",
						testCase.listName,
					)
				}
			}
		})
	}
}

func TestHandler_Edit(t *testing.T) {
	testCases := []struct {
		name       string
		setupList  bool
		listID     string
		userID     string
		ownerID    string
		wantStatus int
	}{
		{
			name:       "successful edit returns input",
			setupList:  true,
			listID:     "test-list",
			userID:     "user-1",
			ownerID:    "user-1",
			wantStatus: http.StatusOK,
		},
		{
			name:       "non-existent list returns not found",
			setupList:  false,
			listID:     "nonexistent",
			userID:     "user-1",
			ownerID:    "",
			wantStatus: http.StatusNotFound,
		},
		{
			name:       "wrong owner returns not found",
			setupList:  true,
			listID:     "test-list",
			userID:     "user-2",
			ownerID:    "user-1",
			wantStatus: http.StatusNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			handler, listService, _ := setupTestHandler(t)

			var createdID string
			if testCase.setupList {
				list, err := listService.Create(
					context.Background(),
					"Test List",
					testCase.ownerID,
				)
				if err != nil {
					t.Fatalf("could not create test list: %v", err)
				}
				createdID = list.ID
			}

			requestID := testCase.listID
			if testCase.setupList && testCase.listID == "test-list" {
				requestID = createdID
			}

			request := httptest.NewRequest(
				http.MethodGet,
				"/lists/"+requestID+"/edit",
				nil,
			)
			request = addUserToContext(request, testCase.userID)
			request = addChiURLParams(
				request,
				map[string]string{"id": requestID},
			)

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
		name       string
		setupList  bool
		newName    string
		userID     string
		ownerID    string
		wantStatus int
	}{
		{
			name:       "successful update",
			setupList:  true,
			newName:    "Updated Name",
			userID:     "user-1",
			ownerID:    "user-1",
			wantStatus: http.StatusOK,
		},
		{
			name:       "empty name returns bad request",
			setupList:  true,
			newName:    "",
			userID:     "user-1",
			ownerID:    "user-1",
			wantStatus: http.StatusBadRequest,
		},
		{
			name:       "non-existent list returns not found",
			setupList:  false,
			newName:    "Updated",
			userID:     "user-1",
			ownerID:    "",
			wantStatus: http.StatusNotFound,
		},
		{
			name:       "wrong owner returns not found",
			setupList:  true,
			newName:    "Updated",
			userID:     "user-2",
			ownerID:    "user-1",
			wantStatus: http.StatusNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			handler, listService, _ := setupTestHandler(t)

			var listID string
			if testCase.setupList {
				list, err := listService.Create(
					context.Background(),
					"Original Name",
					testCase.ownerID,
				)
				if err != nil {
					t.Fatalf("could not create test list: %v", err)
				}
				listID = list.ID
			} else {
				listID = "nonexistent"
			}

			form := url.Values{}
			form.Set(fields.ListName, testCase.newName)

			request := httptest.NewRequest(
				http.MethodPut,
				"/lists/"+listID,
				strings.NewReader(form.Encode()),
			)
			request.Header.Set(
				"Content-Type",
				"application/x-www-form-urlencoded",
			)
			request = addUserToContext(request, testCase.userID)
			request = addChiURLParams(request, map[string]string{"id": listID})

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
				if !strings.Contains(body, testCase.newName) {
					t.Errorf(
						"Update() body should contain new name %q",
						testCase.newName,
					)
				}
			}
		})
	}
}

func TestHandler_Delete(t *testing.T) {
	testCases := []struct {
		name       string
		setupList  bool
		setupTodo  bool
		userID     string
		ownerID    string
		wantStatus int
	}{
		{
			name:       "successful delete",
			setupList:  true,
			setupTodo:  false,
			userID:     "user-1",
			ownerID:    "user-1",
			wantStatus: http.StatusOK,
		},
		{
			name:       "non-existent list returns not found",
			setupList:  false,
			setupTodo:  false,
			userID:     "user-1",
			ownerID:    "",
			wantStatus: http.StatusNotFound,
		},
		{
			name:       "wrong owner returns not found",
			setupList:  true,
			setupTodo:  false,
			userID:     "user-2",
			ownerID:    "user-1",
			wantStatus: http.StatusNotFound,
		},
		{
			name:       "list with todos returns bad request",
			setupList:  true,
			setupTodo:  true,
			userID:     "user-1",
			ownerID:    "user-1",
			wantStatus: http.StatusBadRequest,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			handler, listService, todoService := setupTestHandler(t)

			var listID string
			if testCase.setupList {
				list, err := listService.Create(
					context.Background(),
					"Delete Me",
					testCase.ownerID,
				)
				if err != nil {
					t.Fatalf("could not create test list: %v", err)
				}
				listID = list.ID

				if testCase.setupTodo {
					_, err := todoService.Create(
						context.Background(),
						"Test Todo",
						"",
						listID,
						testCase.ownerID,
					)
					if err != nil {
						t.Fatalf("could not create test todo: %v", err)
					}
				}
			} else {
				listID = "nonexistent"
			}

			request := httptest.NewRequest(
				http.MethodDelete,
				"/lists/"+listID,
				nil,
			)
			request = addUserToContext(request, testCase.userID)
			request = addChiURLParams(request, map[string]string{"id": listID})

			recorder := httptest.NewRecorder()
			handler.Delete(recorder, request)

			if recorder.Code != testCase.wantStatus {
				t.Errorf(
					"Delete() status = %d, want %d",
					recorder.Code,
					testCase.wantStatus,
				)
			}

			if testCase.wantStatus == http.StatusOK && testCase.setupList {
				_, err := listService.GetByID(context.Background(), listID)
				if err != services.ErrListNotFound {
					t.Error("Delete() list should be removed from storage")
				}
			}

			if testCase.wantStatus == http.StatusBadRequest {
				body := recorder.Body.String()
				if !strings.Contains(body, "todos") {
					t.Error("Delete() should mention todos in error message")
				}
			}
		})
	}
}

func TestHandler_Todos(t *testing.T) {
	testCases := []struct {
		name       string
		setupList  bool
		userID     string
		ownerID    string
		sortBy     string
		wantStatus int
	}{
		{
			name:       "returns todos with default sort",
			setupList:  true,
			userID:     "user-1",
			ownerID:    "user-1",
			sortBy:     "",
			wantStatus: http.StatusOK,
		},
		{
			name:       "returns todos sorted by priority",
			setupList:  true,
			userID:     "user-1",
			ownerID:    "user-1",
			sortBy:     "priority",
			wantStatus: http.StatusOK,
		},
		{
			name:       "returns todos sorted by newest first",
			setupList:  true,
			userID:     "user-1",
			ownerID:    "user-1",
			sortBy:     "createdAt-desc",
			wantStatus: http.StatusOK,
		},
		{
			name:       "returns todos sorted by oldest first",
			setupList:  true,
			userID:     "user-1",
			ownerID:    "user-1",
			sortBy:     "createdAt-asc",
			wantStatus: http.StatusOK,
		},
		{
			name:       "returns todos sorted by title A-Z",
			setupList:  true,
			userID:     "user-1",
			ownerID:    "user-1",
			sortBy:     "title-asc",
			wantStatus: http.StatusOK,
		},
		{
			name:       "returns todos sorted by title Z-A",
			setupList:  true,
			userID:     "user-1",
			ownerID:    "user-1",
			sortBy:     "title-desc",
			wantStatus: http.StatusOK,
		},
		{
			name:       "returns todos sorted by recently updated",
			setupList:  true,
			userID:     "user-1",
			ownerID:    "user-1",
			sortBy:     "updatedAt-desc",
			wantStatus: http.StatusOK,
		},
		{
			name:       "non-existent list returns not found",
			setupList:  false,
			userID:     "user-1",
			ownerID:    "",
			sortBy:     "",
			wantStatus: http.StatusNotFound,
		},
		{
			name:       "wrong owner returns not found",
			setupList:  true,
			userID:     "user-2",
			ownerID:    "user-1",
			sortBy:     "",
			wantStatus: http.StatusNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			handler, listService, todoService := setupTestHandler(t)

			var listID string
			if testCase.setupList {
				list, err := listService.Create(
					context.Background(),
					"Test List",
					testCase.ownerID,
				)
				if err != nil {
					t.Fatalf("could not create test list: %v", err)
				}
				listID = list.ID

				todoService.Create(
					context.Background(),
					"Charlie",
					"",
					listID,
					testCase.ownerID,
				)
				todoService.Create(
					context.Background(),
					"Alpha",
					"",
					listID,
					testCase.ownerID,
				)
				todoService.Create(
					context.Background(),
					"Bravo",
					"",
					listID,
					testCase.ownerID,
				)
			} else {
				listID = "nonexistent"
			}

			requestURL := "/lists/" + listID + "/todos"
			if testCase.sortBy != "" {
				requestURL += "?sortBy=" + testCase.sortBy
			}

			request := httptest.NewRequest(http.MethodGet, requestURL, nil)
			request = addUserToContext(request, testCase.userID)
			request = addChiURLParams(request, map[string]string{"id": listID})

			recorder := httptest.NewRecorder()
			handler.Todos(recorder, request)

			if recorder.Code != testCase.wantStatus {
				t.Errorf(
					"Todos() status = %d, want %d",
					recorder.Code,
					testCase.wantStatus,
				)
			}

			if testCase.wantStatus == http.StatusOK {
				body := recorder.Body.String()
				if !strings.Contains(body, "sort-select") {
					t.Error("Todos() should contain sort dropdown")
				}
			}
		})
	}
}

func TestHandler_Todos_SortOrder(t *testing.T) {
	handler, listService, todoService := setupTestHandler(t)

	list, _ := listService.Create(context.Background(), "Test List", "user-1")

	todoService.Create(context.Background(), "Charlie", "", list.ID, "user-1")
	todoService.Create(context.Background(), "Alpha", "", list.ID, "user-1")
	todoService.Create(context.Background(), "Bravo", "", list.ID, "user-1")

	testCases := []struct {
		name      string
		sortBy    string
		wantFirst string
		wantLast  string
	}{
		{
			name:      "title A-Z puts Alpha first",
			sortBy:    "title-asc",
			wantFirst: "Alpha",
			wantLast:  "Charlie",
		},
		{
			name:      "title Z-A puts Charlie first",
			sortBy:    "title-desc",
			wantFirst: "Charlie",
			wantLast:  "Alpha",
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			requestURL := "/lists/" + list.ID + "/todos?sortBy=" + testCase.sortBy
			request := httptest.NewRequest(http.MethodGet, requestURL, nil)
			request = addUserToContext(request, "user-1")
			request = addChiURLParams(request, map[string]string{"id": list.ID})

			recorder := httptest.NewRecorder()
			handler.Todos(recorder, request)

			body := recorder.Body.String()

			firstIdx := strings.Index(body, testCase.wantFirst)
			lastIdx := strings.Index(body, testCase.wantLast)

			if firstIdx == -1 || lastIdx == -1 {
				t.Errorf("body should contain both %s and %s",
					testCase.wantFirst, testCase.wantLast)
				return
			}

			if firstIdx > lastIdx {
				t.Errorf(
					"expected %s before %s in sorted output",
					testCase.wantFirst,
					testCase.wantLast,
				)
			}
		})
	}
}
