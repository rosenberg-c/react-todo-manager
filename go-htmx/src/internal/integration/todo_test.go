package integration

import (
	"context"
	"io"
	"net/http"
	"net/url"
	"strings"
	"testing"

	"go/app/src/internal/fields"
	"go/app/src/internal/routes"
	"go/app/src/internal/services"
)

func TestIntegration_TodoCreate(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "testuser", "testpass")

	form := url.Values{}
	form.Set(fields.TodoTitle, "My New Todo")
	form.Set(fields.TodoListID, "list-1")

	resp, err := ts.client.Post(
		ts.server.URL+routes.Todos,
		"application/x-www-form-urlencoded",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		t.Fatalf("could not create todo: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	if !strings.Contains(string(body), "My New Todo") {
		t.Error("response should contain todo title")
	}
}

func TestIntegration_TodoCreateRequiresAuth(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	form := url.Values{}
	form.Set(fields.TodoTitle, "Unauthorized Todo")
	form.Set(fields.TodoListID, "list-1")

	resp, err := ts.client.Post(
		ts.server.URL+routes.Todos,
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

func TestIntegration_TodoUpdate(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "testuser", "testpass")

	createForm := url.Values{}
	createForm.Set(fields.TodoTitle, "Original Title")
	createForm.Set(fields.TodoListID, "list-1")

	createResp, err := ts.client.Post(
		ts.server.URL+routes.Todos,
		"application/x-www-form-urlencoded",
		strings.NewReader(createForm.Encode()),
	)
	if err != nil {
		t.Fatalf("could not create todo: %v", err)
	}
	createResp.Body.Close()

	user, _ := ts.userService.Login(
		context.Background(),
		"testuser",
		"testpass",
	)
	todos, _ := ts.todoService.GetByUserID(context.Background(), user.ID)
	if len(todos) == 0 {
		t.Fatal("no todos found after creation")
	}
	todoID := todos[0].ID

	editResp, err := ts.client.Get(
		ts.server.URL + "/todos/" + todoID + "/edit",
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

	updateForm := url.Values{}
	updateForm.Set(fields.TodoTitle, "Updated Title")
	updateForm.Set(fields.TodoDescription, "New description")

	updateReq, _ := http.NewRequest(
		http.MethodPut,
		ts.server.URL+"/todos/"+todoID,
		strings.NewReader(updateForm.Encode()),
	)
	updateReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	updateResp, err := ts.client.Do(updateReq)
	if err != nil {
		t.Fatalf("could not update todo: %v", err)
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
	if !strings.Contains(string(updateBody), "Updated Title") {
		t.Error("update response should contain new title")
	}

	updatedTodo, _ := ts.todoService.GetByID(context.Background(), todoID)
	if updatedTodo.Title != "Updated Title" {
		t.Errorf("todo title = %s, want %s", updatedTodo.Title, "Updated Title")
	}
	if updatedTodo.Description != "New description" {
		t.Errorf(
			"todo description = %s, want %s",
			updatedTodo.Description,
			"New description",
		)
	}
}

func TestIntegration_TodoDelete(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "testuser", "testpass")

	createForm := url.Values{}
	createForm.Set(fields.TodoTitle, "Delete Me")
	createForm.Set(fields.TodoListID, "list-1")

	createResp, err := ts.client.Post(
		ts.server.URL+routes.Todos,
		"application/x-www-form-urlencoded",
		strings.NewReader(createForm.Encode()),
	)
	if err != nil {
		t.Fatalf("could not create todo: %v", err)
	}
	createResp.Body.Close()

	user, _ := ts.userService.Login(
		context.Background(),
		"testuser",
		"testpass",
	)
	todos, _ := ts.todoService.GetByUserID(context.Background(), user.ID)
	if len(todos) == 0 {
		t.Fatal("no todos found after creation")
	}
	todoID := todos[0].ID

	deleteReq, _ := http.NewRequest(
		http.MethodDelete,
		ts.server.URL+"/todos/"+todoID,
		nil,
	)

	deleteResp, err := ts.client.Do(deleteReq)
	if err != nil {
		t.Fatalf("could not delete todo: %v", err)
	}
	defer deleteResp.Body.Close()

	if deleteResp.StatusCode != http.StatusOK {
		t.Errorf(
			"delete status = %d, want %d",
			deleteResp.StatusCode,
			http.StatusOK,
		)
	}

	_, err = ts.todoService.GetByID(context.Background(), todoID)
	if err != services.ErrTodoNotFound {
		t.Error("todo should be deleted from storage")
	}
}

func TestIntegration_TodoMove(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "testuser", "testpass")

	createForm := url.Values{}
	createForm.Set(fields.TodoTitle, "Move Me")
	createForm.Set(fields.TodoListID, "list-1")

	createResp, err := ts.client.Post(
		ts.server.URL+routes.Todos,
		"application/x-www-form-urlencoded",
		strings.NewReader(createForm.Encode()),
	)
	if err != nil {
		t.Fatalf("could not create todo: %v", err)
	}
	createResp.Body.Close()

	user, _ := ts.userService.Login(
		context.Background(),
		"testuser",
		"testpass",
	)
	todos, _ := ts.todoService.GetByUserID(context.Background(), user.ID)
	if len(todos) == 0 {
		t.Fatal("no todos found after creation")
	}
	todoID := todos[0].ID

	moveForm := url.Values{}
	moveForm.Set(fields.TodoListID, "list-2")

	moveReq, _ := http.NewRequest(
		http.MethodPost,
		ts.server.URL+"/todos/"+todoID+"/move",
		strings.NewReader(moveForm.Encode()),
	)
	moveReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	moveResp, err := ts.client.Do(moveReq)
	if err != nil {
		t.Fatalf("could not move todo: %v", err)
	}
	defer moveResp.Body.Close()

	if moveResp.StatusCode != http.StatusOK {
		t.Errorf(
			"move status = %d, want %d",
			moveResp.StatusCode,
			http.StatusOK,
		)
	}

	movedTodo, _ := ts.todoService.GetByID(context.Background(), todoID)
	if movedTodo.ListID != "list-2" {
		t.Errorf("todo listID = %s, want %s", movedTodo.ListID, "list-2")
	}
}

func TestIntegration_TodoIsolation(t *testing.T) {
	ts := setupIntegrationTest(t)
	defer ts.close()

	ts.registerAndLogin(t, "user1", "pass1")

	createForm := url.Values{}
	createForm.Set(fields.TodoTitle, "User1 Todo")
	createForm.Set(fields.TodoListID, "list-1")
	createResp, _ := ts.client.Post(
		ts.server.URL+routes.Todos,
		"application/x-www-form-urlencoded",
		strings.NewReader(createForm.Encode()),
	)
	createResp.Body.Close()

	user1, _ := ts.userService.Login(context.Background(), "user1", "pass1")
	user1Todos, _ := ts.todoService.GetByUserID(context.Background(), user1.ID)
	todoID := user1Todos[0].ID

	ts.client.Jar = &testCookieJar{cookies: make(map[string][]*http.Cookie)}
	ts.registerAndLogin(t, "user2", "pass2")

	deleteReq, _ := http.NewRequest(
		http.MethodDelete,
		ts.server.URL+"/todos/"+todoID,
		nil,
	)

	deleteResp, err := ts.client.Do(deleteReq)
	if err != nil {
		t.Fatalf("could not make delete request: %v", err)
	}
	defer deleteResp.Body.Close()

	if deleteResp.StatusCode != http.StatusNotFound {
		t.Errorf(
			"delete other user's todo status = %d, want %d",
			deleteResp.StatusCode,
			http.StatusNotFound,
		)
	}

	_, err = ts.todoService.GetByID(context.Background(), todoID)
	if err != nil {
		t.Error("user1's todo should still exist after user2's delete attempt")
	}
}
