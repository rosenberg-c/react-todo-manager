package repository

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"

	"go/app/src/internal/models"
)

func setupTestTodoRepo(t *testing.T) *JSONTodoRepository {
	tmpDir := t.TempDir()
	todosFile := filepath.Join(tmpDir, "todos.json")
	if err := os.WriteFile(todosFile, []byte("[]"), 0644); err != nil {
		t.Fatalf("could not create todos file: %v", err)
	}
	store := NewJSONStore(todosFile)
	return NewJSONTodoRepository(store)
}

func TestJSONTodoRepository_Create(t *testing.T) {
	repo := setupTestTodoRepo(t)
	ctx := context.Background()

	todo := models.Todo{
		ID:        "test-id",
		Title:     "Test Todo",
		UserID:    "user-1",
		ListID:    "list-1",
		Priority:  1,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := repo.Create(ctx, todo); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	got, err := repo.GetByID(ctx, "test-id")
	if err != nil {
		t.Fatalf("GetByID() error = %v", err)
	}

	if got.Title != todo.Title {
		t.Errorf("GetByID() title = %v, want %v", got.Title, todo.Title)
	}
}

func TestJSONTodoRepository_GetByID(t *testing.T) {
	repo := setupTestTodoRepo(t)
	ctx := context.Background()

	todo := models.Todo{
		ID:        "test-id",
		Title:     "Test Todo",
		UserID:    "user-1",
		Priority:  1,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := repo.Create(ctx, todo); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	testCases := []struct {
		name    string
		id      string
		wantErr error
	}{
		{
			name:    "existing todo",
			id:      "test-id",
			wantErr: nil,
		},
		{
			name:    "non-existing todo",
			id:      "notfound",
			wantErr: ErrTodoNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			_, err := repo.GetByID(ctx, testCase.id)
			if err != testCase.wantErr {
				t.Errorf(
					"GetByID() error = %v, want %v",
					err,
					testCase.wantErr,
				)
			}
		})
	}
}

func TestJSONTodoRepository_GetByUserID(t *testing.T) {
	repo := setupTestTodoRepo(t)
	ctx := context.Background()

	todos := []models.Todo{
		{
			ID:        "todo-1",
			Title:     "User1 Todo 1",
			UserID:    "user-1",
			Priority:  1,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        "todo-2",
			Title:     "User1 Todo 2",
			UserID:    "user-1",
			Priority:  2,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        "todo-3",
			Title:     "User2 Todo",
			UserID:    "user-2",
			Priority:  1,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	for _, todo := range todos {
		if err := repo.Create(ctx, todo); err != nil {
			t.Fatalf("Create() error = %v", err)
		}
	}

	testCases := []struct {
		name      string
		userID    string
		wantCount int
	}{
		{
			name:      "user with two todos",
			userID:    "user-1",
			wantCount: 2,
		},
		{
			name:      "user with one todo",
			userID:    "user-2",
			wantCount: 1,
		},
		{
			name:      "user with no todos",
			userID:    "user-3",
			wantCount: 0,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			got, err := repo.GetByUserID(ctx, testCase.userID)
			if err != nil {
				t.Fatalf("GetByUserID() error = %v", err)
			}
			if len(got) != testCase.wantCount {
				t.Errorf(
					"GetByUserID() count = %v, want %v",
					len(got),
					testCase.wantCount,
				)
			}
		})
	}
}

func TestJSONTodoRepository_GetByListID(t *testing.T) {
	repo := setupTestTodoRepo(t)
	ctx := context.Background()

	todos := []models.Todo{
		{
			ID:        "todo-1",
			Title:     "List1 Todo 1",
			UserID:    "user-1",
			ListID:    "list-1",
			Priority:  1,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        "todo-2",
			Title:     "List1 Todo 2",
			UserID:    "user-1",
			ListID:    "list-1",
			Priority:  2,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        "todo-3",
			Title:     "List2 Todo",
			UserID:    "user-1",
			ListID:    "list-2",
			Priority:  1,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        "todo-4",
			Title:     "No List Todo",
			UserID:    "user-1",
			ListID:    "",
			Priority:  1,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	for _, todo := range todos {
		if err := repo.Create(ctx, todo); err != nil {
			t.Fatalf("Create() error = %v", err)
		}
	}

	testCases := []struct {
		name      string
		listID    string
		wantCount int
	}{
		{
			name:      "list with two todos",
			listID:    "list-1",
			wantCount: 2,
		},
		{
			name:      "list with one todo",
			listID:    "list-2",
			wantCount: 1,
		},
		{
			name:      "empty list",
			listID:    "list-3",
			wantCount: 0,
		},
		{
			name:      "todos without list",
			listID:    "",
			wantCount: 1,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			got, err := repo.GetByListID(ctx, testCase.listID)
			if err != nil {
				t.Fatalf("GetByListID() error = %v", err)
			}
			if len(got) != testCase.wantCount {
				t.Errorf(
					"GetByListID() count = %v, want %v",
					len(got),
					testCase.wantCount,
				)
			}
		})
	}
}

func TestJSONTodoRepository_Update(t *testing.T) {
	repo := setupTestTodoRepo(t)
	ctx := context.Background()

	todo := models.Todo{
		ID:        "test-id",
		Title:     "Original",
		UserID:    "user-1",
		Priority:  1,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := repo.Create(ctx, todo); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	todo.Title = "Updated"
	todo.Description = "Added description"
	if err := repo.Update(ctx, todo); err != nil {
		t.Fatalf("Update() error = %v", err)
	}

	got, err := repo.GetByID(ctx, "test-id")
	if err != nil {
		t.Fatalf("GetByID() error = %v", err)
	}

	if got.Title != "Updated" {
		t.Errorf("Update() title = %v, want %v", got.Title, "Updated")
	}
	if got.Description != "Added description" {
		t.Errorf(
			"Update() description = %v, want %v",
			got.Description,
			"Added description",
		)
	}
}

func TestJSONTodoRepository_UpdateNotFound(t *testing.T) {
	repo := setupTestTodoRepo(t)
	ctx := context.Background()

	todo := models.Todo{
		ID:        "nonexistent",
		Title:     "Test",
		UserID:    "user-1",
		Priority:  1,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err := repo.Update(ctx, todo)
	if err != ErrTodoNotFound {
		t.Errorf("Update() error = %v, want %v", err, ErrTodoNotFound)
	}
}

func TestJSONTodoRepository_Delete(t *testing.T) {
	repo := setupTestTodoRepo(t)
	ctx := context.Background()

	todo := models.Todo{
		ID:        "test-id",
		Title:     "Delete Me",
		UserID:    "user-1",
		Priority:  1,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := repo.Create(ctx, todo); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	if err := repo.Delete(ctx, "test-id"); err != nil {
		t.Fatalf("Delete() error = %v", err)
	}

	_, err := repo.GetByID(ctx, "test-id")
	if err != ErrTodoNotFound {
		t.Errorf(
			"GetByID() after delete error = %v, want %v",
			err,
			ErrTodoNotFound,
		)
	}
}

func TestJSONTodoRepository_DeleteNotFound(t *testing.T) {
	repo := setupTestTodoRepo(t)
	ctx := context.Background()

	err := repo.Delete(ctx, "nonexistent")
	if err != ErrTodoNotFound {
		t.Errorf("Delete() error = %v, want %v", err, ErrTodoNotFound)
	}
}
