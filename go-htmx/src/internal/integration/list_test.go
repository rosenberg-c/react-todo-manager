package integration

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"go/app/src/internal/fields"
	authHandler "go/app/src/internal/handlers/auth"
	homeHandler "go/app/src/internal/handlers/home"
	listHandler "go/app/src/internal/handlers/list"
	todoHandler "go/app/src/internal/handlers/todo"
	authmw "go/app/src/internal/middleware/auth"
	"go/app/src/internal/repository"
	"go/app/src/internal/routes"
	"go/app/src/internal/services"
	authfields "go/app/src/templates/components/auth-fields"

	"github.com/go-chi/chi/v5"
)

type testServer struct {
	server      *httptest.Server
	client      *http.Client
	userService *services.UserService
	listService *services.ListService
	todoService *services.TodoService
}

func setupIntegrationTest(t *testing.T) *testServer {
	tmpDir := t.TempDir()

	usersFile := filepath.Join(tmpDir, "users.json")
	listsFile := filepath.Join(tmpDir, "lists.json")
	todosFile := filepath.Join(tmpDir, "todos.json")
	if err := os.WriteFile(usersFile, []byte("[]"), 0644); err != nil {
		t.Fatalf("could not create users file: %v", err)
	}
	if err := os.WriteFile(listsFile, []byte("[]"), 0644); err != nil {
		t.Fatalf("could not create lists file: %v", err)
	}
	if err := os.WriteFile(todosFile, []byte("[]"), 0644); err != nil {
		t.Fatalf("could not create todos file: %v", err)
	}

	userStore := repository.NewJSONStore(usersFile)
	listStore := repository.NewJSONStore(listsFile)
	todoStore := repository.NewJSONStore(todosFile)

	userRepo := repository.NewJSONUserRepository(userStore)
	listRepo := repository.NewJSONListRepository(listStore)
	todoRepo := repository.NewJSONTodoRepository(todoStore)

	userService := services.NewUserService(userRepo)
	listService := services.NewListService(listRepo)
	todoService := services.NewTodoService(todoRepo)

	authMiddleware := authmw.NewAuthMiddleware("test-secret-key", userService)
	authHandler := authHandler.NewHandler(userService, authMiddleware)
	homeHandler := homeHandler.NewHandler(userService, listService, todoService)
	listHandler := listHandler.NewHandler(listService, todoService)
	todoHandler := todoHandler.NewHandler(todoService)

	router := chi.NewRouter()

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

		router.Post(routes.Lists, listHandler.Create)
		router.Get(routes.ListByIDEdit, listHandler.ShowEdit)
		router.Get(routes.ListByIDTodos, listHandler.Todos)
		router.Put(routes.ListByID, listHandler.Update)
		router.Delete(routes.ListByID, listHandler.Delete)

		router.Post(routes.Todos, todoHandler.Create)
		router.Get(routes.TodoByIDEdit, todoHandler.ShowEdit)
		router.Put(routes.TodoByID, todoHandler.Update)
		router.Delete(routes.TodoByID, todoHandler.Delete)
		router.Post(routes.TodoByIDMove, todoHandler.Move)
	})

	server := httptest.NewServer(router)

	jar := &testCookieJar{cookies: make(map[string][]*http.Cookie)}
	client := &http.Client{
		Jar: jar,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}

	return &testServer{
		server:      server,
		client:      client,
		userService: userService,
		listService: listService,
		todoService: todoService,
	}
}

type testCookieJar struct {
	cookies map[string][]*http.Cookie
}

func (jar *testCookieJar) SetCookies(u *url.URL, cookies []*http.Cookie) {
	jar.cookies[u.Host] = append(jar.cookies[u.Host], cookies...)
}

func (jar *testCookieJar) Cookies(u *url.URL) []*http.Cookie {
	return jar.cookies[u.Host]
}

func (ts *testServer) registerAndLogin(
	t *testing.T,
	username string,
	password string,
) {
	form := url.Values{}
	form.Set(authfields.Username, username)
	form.Set(authfields.Password, password)

	resp, err := ts.client.Post(
		ts.server.URL+routes.Register,
		"application/x-www-form-urlencoded",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		t.Fatalf("could not register: %v", err)
	}
	resp.Body.Close()

	resp, err = ts.client.Post(
		ts.server.URL+routes.Login,
		"application/x-www-form-urlencoded",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		t.Fatalf("could not login: %v", err)
	}
	resp.Body.Close()
}

func (ts *testServer) close() {
	ts.server.Close()
}

func TestIntegration_ListCreate(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "testuser", "testpass")

	form := url.Values{}
	form.Set(fields.ListName, "My New List")

	resp, err := ts.client.Post(
		ts.server.URL+routes.Lists,
		"application/x-www-form-urlencoded",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		t.Fatalf("could not create list: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	if !strings.Contains(string(body), "My New List") {
		t.Error("response should contain list name")
	}
}

func TestIntegration_ListCreateRequiresAuth(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	form := url.Values{}
	form.Set(fields.ListName, "Unauthorized List")

	resp, err := ts.client.Post(
		ts.server.URL+routes.Lists,
		"application/x-www-form-urlencoded",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		t.Fatalf("could not make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusFound {
		t.Errorf(
			"expected redirect status %d, got %d",
			http.StatusFound,
			resp.StatusCode,
		)
	}

	location := resp.Header.Get("Location")
	if location != routes.Login {
		t.Errorf("expected redirect to %s, got %s", routes.Login, location)
	}
}

func TestIntegration_ListRename(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "testuser", "testpass")

	createForm := url.Values{}
	createForm.Set(fields.ListName, "Original Name")

	createResp, err := ts.client.Post(
		ts.server.URL+routes.Lists,
		"application/x-www-form-urlencoded",
		strings.NewReader(createForm.Encode()),
	)
	if err != nil {
		t.Fatalf("could not create list: %v", err)
	}
	createResp.Body.Close()

	user, _ := ts.userService.Login(
		context.Background(),
		"testuser",
		"testpass",
	)
	lists, _ := ts.listService.GetByUserID(context.Background(), user.ID)
	if len(lists) == 0 {
		t.Fatal("no lists found after creation")
	}
	listID := lists[0].ID

	editResp, err := ts.client.Get(
		ts.server.URL + "/lists/" + listID + "/edit",
	)
	if err != nil {
		t.Fatalf("could not get edit form: %v", err)
	}
	defer editResp.Body.Close()

	if editResp.StatusCode != http.StatusOK {
		t.Errorf(
			"edit endpoint status = %d, want %d",
			editResp.StatusCode,
			http.StatusOK,
		)
	}

	editBody, _ := io.ReadAll(editResp.Body)
	if !strings.Contains(string(editBody), "input") {
		t.Error("edit response should contain input element")
	}

	updateForm := url.Values{}
	updateForm.Set(fields.ListName, "Renamed List")

	updateReq, _ := http.NewRequest(
		http.MethodPut,
		ts.server.URL+"/lists/"+listID,
		strings.NewReader(updateForm.Encode()),
	)
	updateReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	updateResp, err := ts.client.Do(updateReq)
	if err != nil {
		t.Fatalf("could not update list: %v", err)
	}
	defer updateResp.Body.Close()

	if updateResp.StatusCode != http.StatusOK {
		t.Errorf(
			"update status = %d, want %d",
			updateResp.StatusCode,
			http.StatusOK,
		)
	}

	updateBody, _ := io.ReadAll(updateResp.Body)
	if !strings.Contains(string(updateBody), "Renamed List") {
		t.Error("update response should contain new list name")
	}

	updatedList, _ := ts.listService.GetByID(context.Background(), listID)
	if updatedList.Name != "Renamed List" {
		t.Errorf("list name = %s, want %s", updatedList.Name, "Renamed List")
	}
}

func TestIntegration_ListDelete(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "testuser", "testpass")

	createForm := url.Values{}
	createForm.Set(fields.ListName, "Delete Me")

	createResp, err := ts.client.Post(
		ts.server.URL+routes.Lists,
		"application/x-www-form-urlencoded",
		strings.NewReader(createForm.Encode()),
	)
	if err != nil {
		t.Fatalf("could not create list: %v", err)
	}
	createResp.Body.Close()

	user, _ := ts.userService.Login(
		context.Background(),
		"testuser",
		"testpass",
	)
	lists, _ := ts.listService.GetByUserID(context.Background(), user.ID)
	if len(lists) == 0 {
		t.Fatal("no lists found after creation")
	}
	listID := lists[0].ID

	deleteReq, _ := http.NewRequest(
		http.MethodDelete,
		ts.server.URL+"/lists/"+listID,
		nil,
	)

	deleteResp, err := ts.client.Do(deleteReq)
	if err != nil {
		t.Fatalf("could not delete list: %v", err)
	}
	defer deleteResp.Body.Close()

	if deleteResp.StatusCode != http.StatusOK {
		t.Errorf(
			"delete status = %d, want %d",
			deleteResp.StatusCode,
			http.StatusOK,
		)
	}

	_, err = ts.listService.GetByID(context.Background(), listID)
	if err != services.ErrListNotFound {
		t.Error("list should be deleted from storage")
	}
}

func TestIntegration_ListDeleteWithTodos(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "testuser", "testpass")

	listForm := url.Values{}
	listForm.Set(fields.ListName, "List With Todos")

	listResp, err := ts.client.Post(
		ts.server.URL+routes.Lists,
		"application/x-www-form-urlencoded",
		strings.NewReader(listForm.Encode()),
	)
	if err != nil {
		t.Fatalf("could not create list: %v", err)
	}
	listResp.Body.Close()

	user, _ := ts.userService.Login(
		context.Background(),
		"testuser",
		"testpass",
	)
	lists, _ := ts.listService.GetByUserID(context.Background(), user.ID)
	if len(lists) == 0 {
		t.Fatal("no lists found after creation")
	}
	listID := lists[0].ID

	todoForm := url.Values{}
	todoForm.Set(fields.TodoTitle, "Test Todo")
	todoForm.Set(fields.TodoListID, listID)

	todoResp, err := ts.client.Post(
		ts.server.URL+routes.Todos,
		"application/x-www-form-urlencoded",
		strings.NewReader(todoForm.Encode()),
	)
	if err != nil {
		t.Fatalf("could not create todo: %v", err)
	}
	todoResp.Body.Close()

	deleteReq, _ := http.NewRequest(
		http.MethodDelete,
		ts.server.URL+"/lists/"+listID,
		nil,
	)

	deleteResp, err := ts.client.Do(deleteReq)
	if err != nil {
		t.Fatalf("could not make delete request: %v", err)
	}
	defer deleteResp.Body.Close()

	if deleteResp.StatusCode != http.StatusBadRequest {
		t.Errorf(
			"delete list with todos status = %d, want %d",
			deleteResp.StatusCode,
			http.StatusBadRequest,
		)
	}

	_, err = ts.listService.GetByID(context.Background(), listID)
	if err != nil {
		t.Error("list should still exist after failed delete")
	}

	body, _ := io.ReadAll(deleteResp.Body)
	if !strings.Contains(string(body), "todos") {
		t.Error("error message should mention todos")
	}
}

func TestIntegration_ListIsolation(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "user1", "pass1")

	createForm := url.Values{}
	createForm.Set(fields.ListName, "User1 List")
	createResp, _ := ts.client.Post(
		ts.server.URL+routes.Lists,
		"application/x-www-form-urlencoded",
		strings.NewReader(createForm.Encode()),
	)
	createResp.Body.Close()

	user1, _ := ts.userService.Login(context.Background(), "user1", "pass1")
	user1Lists, _ := ts.listService.GetByUserID(context.Background(), user1.ID)
	listID := user1Lists[0].ID

	ts.client.Jar = &testCookieJar{cookies: make(map[string][]*http.Cookie)}
	ts.registerAndLogin(t, "user2", "pass2")

	deleteReq, _ := http.NewRequest(
		http.MethodDelete,
		ts.server.URL+"/lists/"+listID,
		nil,
	)

	deleteResp, err := ts.client.Do(deleteReq)
	if err != nil {
		t.Fatalf("could not make delete request: %v", err)
	}
	defer deleteResp.Body.Close()

	if deleteResp.StatusCode != http.StatusNotFound {
		t.Errorf(
			"delete other user's list status = %d, want %d",
			deleteResp.StatusCode,
			http.StatusNotFound,
		)
	}

	_, err = ts.listService.GetByID(context.Background(), listID)
	if err != nil {
		t.Error("user1's list should still exist after user2's delete attempt")
	}
}

func TestIntegration_ListTodosSorting(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "testuser", "testpass")

	listForm := url.Values{}
	listForm.Set(fields.ListName, "Sort Test List")

	listResp, err := ts.client.Post(
		ts.server.URL+routes.Lists,
		"application/x-www-form-urlencoded",
		strings.NewReader(listForm.Encode()),
	)
	if err != nil {
		t.Fatalf("could not create list: %v", err)
	}
	listResp.Body.Close()

	user, _ := ts.userService.Login(
		context.Background(),
		"testuser",
		"testpass",
	)
	lists, _ := ts.listService.GetByUserID(context.Background(), user.ID)
	listID := lists[0].ID

	titles := []string{"Charlie", "Alpha", "Bravo"}
	for _, title := range titles {
		todoForm := url.Values{}
		todoForm.Set(fields.TodoTitle, title)
		todoForm.Set(fields.TodoListID, listID)

		todoResp, err := ts.client.Post(
			ts.server.URL+routes.Todos,
			"application/x-www-form-urlencoded",
			strings.NewReader(todoForm.Encode()),
		)
		if err != nil {
			t.Fatalf("could not create todo: %v", err)
		}
		todoResp.Body.Close()
	}

	testCases := []struct {
		name      string
		sortBy    string
		wantFirst string
		wantLast  string
	}{
		{
			name:      "sort by title A-Z",
			sortBy:    "title-asc",
			wantFirst: "Alpha",
			wantLast:  "Charlie",
		},
		{
			name:      "sort by title Z-A",
			sortBy:    "title-desc",
			wantFirst: "Charlie",
			wantLast:  "Alpha",
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			sortURL := ts.server.URL + "/lists/" + listID +
				"/todos?sortBy=" + testCase.sortBy

			resp, err := ts.client.Get(sortURL)
			if err != nil {
				t.Fatalf("could not get sorted todos: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				t.Errorf("status = %d, want %d",
					resp.StatusCode, http.StatusOK)
			}

			body, _ := io.ReadAll(resp.Body)
			bodyStr := string(body)

			firstIdx := strings.Index(bodyStr, testCase.wantFirst)
			lastIdx := strings.Index(bodyStr, testCase.wantLast)

			if firstIdx == -1 || lastIdx == -1 {
				t.Errorf("body should contain both %s and %s",
					testCase.wantFirst, testCase.wantLast)
				return
			}

			if firstIdx > lastIdx {
				t.Errorf("expected %s before %s",
					testCase.wantFirst, testCase.wantLast)
			}
		})
	}
}

func TestIntegration_ListTodosSortingRequiresAuth(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	resp, err := ts.client.Get(ts.server.URL + "/lists/some-id/todos")
	if err != nil {
		t.Fatalf("could not make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusFound {
		t.Errorf("status = %d, want %d", resp.StatusCode, http.StatusFound)
	}

	location := resp.Header.Get("Location")
	if location != routes.Login {
		t.Errorf("redirect location = %s, want %s", location, routes.Login)
	}
}

func TestIntegration_HomeSortPersistence(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "testuser", "testpass")

	listForm := url.Values{}
	listForm.Set(fields.ListName, "Test List")

	listResp, err := ts.client.Post(
		ts.server.URL+routes.Lists,
		"application/x-www-form-urlencoded",
		strings.NewReader(listForm.Encode()),
	)
	if err != nil {
		t.Fatalf("could not create list: %v", err)
	}
	listResp.Body.Close()

	user, _ := ts.userService.Login(
		context.Background(),
		"testuser",
		"testpass",
	)
	lists, _ := ts.listService.GetByUserID(context.Background(), user.ID)
	listID := lists[0].ID

	titles := []string{"Charlie", "Alpha", "Bravo"}
	for _, title := range titles {
		todoForm := url.Values{}
		todoForm.Set(fields.TodoTitle, title)
		todoForm.Set(fields.TodoListID, listID)

		todoResp, err := ts.client.Post(
			ts.server.URL+routes.Todos,
			"application/x-www-form-urlencoded",
			strings.NewReader(todoForm.Encode()),
		)
		if err != nil {
			t.Fatalf("could not create todo: %v", err)
		}
		todoResp.Body.Close()
	}

	testCases := []struct {
		name      string
		sortBy    string
		wantFirst string
		wantLast  string
	}{
		{
			name:      "home with title-asc shows Alpha first",
			sortBy:    "title-asc",
			wantFirst: "Alpha",
			wantLast:  "Charlie",
		},
		{
			name:      "home with title-desc shows Charlie first",
			sortBy:    "title-desc",
			wantFirst: "Charlie",
			wantLast:  "Alpha",
		},
		{
			name:      "home with no sortBy defaults to priority",
			sortBy:    "",
			wantFirst: "Charlie",
			wantLast:  "Bravo",
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			homeURL := ts.server.URL + routes.Home
			if testCase.sortBy != "" {
				homeURL += "?sortBy=" + testCase.sortBy
			}

			resp, err := ts.client.Get(homeURL)
			if err != nil {
				t.Fatalf("could not get home page: %v", err)
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				t.Errorf("status = %d, want %d",
					resp.StatusCode, http.StatusOK)
			}

			body, _ := io.ReadAll(resp.Body)
			bodyStr := string(body)

			firstIdx := strings.Index(bodyStr, testCase.wantFirst)
			lastIdx := strings.Index(bodyStr, testCase.wantLast)

			if firstIdx == -1 || lastIdx == -1 {
				t.Errorf("body should contain both %s and %s",
					testCase.wantFirst, testCase.wantLast)
				return
			}

			if firstIdx > lastIdx {
				t.Errorf("expected %s before %s",
					testCase.wantFirst, testCase.wantLast)
			}
		})
	}
}

func TestIntegration_HomeSortDropdownSelection(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "testuser", "testpass")

	listForm := url.Values{}
	listForm.Set(fields.ListName, "Test List")

	listResp, err := ts.client.Post(
		ts.server.URL+routes.Lists,
		"application/x-www-form-urlencoded",
		strings.NewReader(listForm.Encode()),
	)
	if err != nil {
		t.Fatalf("could not create list: %v", err)
	}
	listResp.Body.Close()

	testCases := []struct {
		name           string
		sortBy         string
		wantSelected   string
		wantUnselected string
	}{
		{
			name:           "title-asc selected",
			sortBy:         "title-asc",
			wantSelected:   `value="title-asc" selected`,
			wantUnselected: `value="priority" selected`,
		},
		{
			name:           "priority selected by default",
			sortBy:         "",
			wantSelected:   `value="priority" selected`,
			wantUnselected: `value="title-asc" selected`,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			homeURL := ts.server.URL + routes.Home
			if testCase.sortBy != "" {
				homeURL += "?sortBy=" + testCase.sortBy
			}

			resp, err := ts.client.Get(homeURL)
			if err != nil {
				t.Fatalf("could not get home page: %v", err)
			}
			defer resp.Body.Close()

			body, _ := io.ReadAll(resp.Body)
			bodyStr := string(body)

			if !strings.Contains(bodyStr, testCase.wantSelected) {
				t.Errorf("body should contain %q", testCase.wantSelected)
			}

			if strings.Contains(bodyStr, testCase.wantUnselected) {
				t.Errorf("body should not contain %q", testCase.wantUnselected)
			}
		})
	}
}

func TestIntegration_StaleSessionRedirectsToLogin(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "testuser", "testpass")

	// Verify we can access home while logged in
	resp, err := ts.client.Get(ts.server.URL + routes.Home)
	if err != nil {
		t.Fatalf("could not access home: %v", err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf(
			"expected status %d for home, got %d",
			http.StatusOK,
			resp.StatusCode,
		)
	}

	// Delete the user from the database (simulating a deleted account)
	user, err := ts.userService.Login(
		context.Background(),
		"testuser",
		"testpass",
	)
	if err != nil {
		t.Fatalf("could not get user: %v", err)
	}
	if err := ts.userService.Delete(context.Background(), user.ID); err != nil {
		t.Fatalf("could not delete user: %v", err)
	}

	// Now try to access a protected route with the stale session
	resp, err = ts.client.Get(ts.server.URL + routes.Home)
	if err != nil {
		t.Fatalf("could not make request: %v", err)
	}
	defer resp.Body.Close()

	// Should redirect to login
	if resp.StatusCode != http.StatusFound {
		t.Errorf(
			"expected redirect status %d, got %d",
			http.StatusFound,
			resp.StatusCode,
		)
	}

	location := resp.Header.Get("Location")
	if location != routes.Login {
		t.Errorf("expected redirect to %s, got %s", routes.Login, location)
	}

	// Follow the redirect to login page - should succeed without redirect loop
	resp, err = ts.client.Get(ts.server.URL + routes.Login)
	if err != nil {
		t.Fatalf("could not access login page: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf(
			"login page status = %d, want %d",
			resp.StatusCode,
			http.StatusOK,
		)
	}
}
