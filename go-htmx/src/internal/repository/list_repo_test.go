package repository

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"

	"go/app/src/internal/models"
)

func setupTestListRepo(t *testing.T) *JSONListRepository {
	tmpDir := t.TempDir()
	listsFile := filepath.Join(tmpDir, "lists.json")
	if err := os.WriteFile(listsFile, []byte("[]"), 0644); err != nil {
		t.Fatalf("could not create lists file: %v", err)
	}
	store := NewJSONStore(listsFile)
	return NewJSONListRepository(store)
}

func TestJSONListRepository_Create(t *testing.T) {
	repo := setupTestListRepo(t)
	ctx := context.Background()

	list := models.List{
		ID:        "test-id",
		Name:      "To Do",
		UserID:    "user-1",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := repo.Create(ctx, list); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	got, err := repo.GetByID(ctx, "test-id")
	if err != nil {
		t.Fatalf("GetByID() error = %v", err)
	}

	if got.Name != list.Name {
		t.Errorf("GetByID() name = %v, want %v", got.Name, list.Name)
	}
}

func TestJSONListRepository_GetByID(t *testing.T) {
	repo := setupTestListRepo(t)
	ctx := context.Background()

	list := models.List{
		ID:        "test-id",
		Name:      "To Do",
		UserID:    "user-1",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := repo.Create(ctx, list); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	testCases := []struct {
		name    string
		id      string
		wantErr error
	}{
		{
			name:    "existing list",
			id:      "test-id",
			wantErr: nil,
		},
		{
			name:    "non-existing list",
			id:      "notfound",
			wantErr: ErrListNotFound,
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

func TestJSONListRepository_GetByUserID(t *testing.T) {
	repo := setupTestListRepo(t)
	ctx := context.Background()

	lists := []models.List{
		{
			ID:        "list-1",
			Name:      "To Do",
			UserID:    "user-1",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        "list-2",
			Name:      "In Progress",
			UserID:    "user-1",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        "list-3",
			Name:      "Other User List",
			UserID:    "user-2",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	for _, list := range lists {
		if err := repo.Create(ctx, list); err != nil {
			t.Fatalf("Create() error = %v", err)
		}
	}

	testCases := []struct {
		name      string
		userID    string
		wantCount int
	}{
		{
			name:      "user with two lists",
			userID:    "user-1",
			wantCount: 2,
		},
		{
			name:      "user with one list",
			userID:    "user-2",
			wantCount: 1,
		},
		{
			name:      "user with no lists",
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

func TestJSONListRepository_Update(t *testing.T) {
	repo := setupTestListRepo(t)
	ctx := context.Background()

	list := models.List{
		ID:        "test-id",
		Name:      "Original",
		UserID:    "user-1",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := repo.Create(ctx, list); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	list.Name = "Updated"
	if err := repo.Update(ctx, list); err != nil {
		t.Fatalf("Update() error = %v", err)
	}

	got, err := repo.GetByID(ctx, "test-id")
	if err != nil {
		t.Fatalf("GetByID() error = %v", err)
	}

	if got.Name != "Updated" {
		t.Errorf("Update() name = %v, want %v", got.Name, "Updated")
	}
}

func TestJSONListRepository_UpdateNotFound(t *testing.T) {
	repo := setupTestListRepo(t)
	ctx := context.Background()

	list := models.List{
		ID:        "nonexistent",
		Name:      "Test",
		UserID:    "user-1",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err := repo.Update(ctx, list)
	if err != ErrListNotFound {
		t.Errorf("Update() error = %v, want %v", err, ErrListNotFound)
	}
}

func TestJSONListRepository_Delete(t *testing.T) {
	repo := setupTestListRepo(t)
	ctx := context.Background()

	list := models.List{
		ID:        "test-id",
		Name:      "Delete Me",
		UserID:    "user-1",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := repo.Create(ctx, list); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	if err := repo.Delete(ctx, "test-id"); err != nil {
		t.Fatalf("Delete() error = %v", err)
	}

	_, err := repo.GetByID(ctx, "test-id")
	if err != ErrListNotFound {
		t.Errorf(
			"GetByID() after delete error = %v, want %v",
			err,
			ErrListNotFound,
		)
	}
}

func TestJSONListRepository_DeleteNotFound(t *testing.T) {
	repo := setupTestListRepo(t)
	ctx := context.Background()

	err := repo.Delete(ctx, "nonexistent")
	if err != ErrListNotFound {
		t.Errorf("Delete() error = %v, want %v", err, ErrListNotFound)
	}
}
