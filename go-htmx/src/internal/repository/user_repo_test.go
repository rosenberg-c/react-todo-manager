package repository

import (
	"context"
	"os"
	"path/filepath"
	"testing"
	"time"

	"go/app/src/internal/models"
)

func setupTestUserRepo(t *testing.T) *JSONUserRepository {
	tmpDir := t.TempDir()
	usersFile := filepath.Join(tmpDir, "users.json")
	if err := os.WriteFile(usersFile, []byte("[]"), 0644); err != nil {
		t.Fatalf("could not create users file: %v", err)
	}
	store := NewJSONStore(usersFile)
	return NewJSONUserRepository(store)
}

func TestJSONUserRepository_Create(t *testing.T) {
	repo := setupTestUserRepo(t)
	ctx := context.Background()

	user := models.User{
		ID:           "test-id",
		Username:     "testuser",
		PasswordHash: "hash",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := repo.Create(ctx, user); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	got, err := repo.GetByID(ctx, "test-id")
	if err != nil {
		t.Fatalf("GetByID() error = %v", err)
	}

	if got.Username != user.Username {
		t.Errorf(
			"GetByID() username = %v, want %v",
			got.Username,
			user.Username,
		)
	}
}

func TestJSONUserRepository_GetByUsername(t *testing.T) {
	repo := setupTestUserRepo(t)
	ctx := context.Background()

	user := models.User{
		ID:           "test-id",
		Username:     "findme",
		PasswordHash: "hash",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := repo.Create(ctx, user); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	tests := []struct {
		name     string
		username string
		wantErr  error
	}{
		{
			name:     "existing user",
			username: "findme",
			wantErr:  nil,
		},
		{
			name:     "non-existing user",
			username: "notfound",
			wantErr:  ErrUserNotFound,
		},
	}

	for _, testCase := range tests {
		t.Run(testCase.name, func(t *testing.T) {
			_, err := repo.GetByUsername(ctx, testCase.username)
			if err != testCase.wantErr {
				t.Errorf(
					"GetByUsername() error = %v, want %v",
					err,
					testCase.wantErr,
				)
			}
		})
	}
}

func TestJSONUserRepository_Update(t *testing.T) {
	repo := setupTestUserRepo(t)
	ctx := context.Background()

	user := models.User{
		ID:           "test-id",
		Username:     "original",
		PasswordHash: "hash",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := repo.Create(ctx, user); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	user.Username = "updated"
	if err := repo.Update(ctx, user); err != nil {
		t.Fatalf("Update() error = %v", err)
	}

	got, err := repo.GetByID(ctx, "test-id")
	if err != nil {
		t.Fatalf("GetByID() error = %v", err)
	}

	if got.Username != "updated" {
		t.Errorf("Update() username = %v, want %v", got.Username, "updated")
	}
}

func TestJSONUserRepository_Delete(t *testing.T) {
	repo := setupTestUserRepo(t)
	ctx := context.Background()

	user := models.User{
		ID:           "test-id",
		Username:     "deleteme",
		PasswordHash: "hash",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := repo.Create(ctx, user); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	if err := repo.Delete(ctx, "test-id"); err != nil {
		t.Fatalf("Delete() error = %v", err)
	}

	_, err := repo.GetByID(ctx, "test-id")
	if err != ErrUserNotFound {
		t.Errorf(
			"GetByID() after delete error = %v, want %v",
			err,
			ErrUserNotFound,
		)
	}
}

func TestJSONUserRepository_DeleteNotFound(t *testing.T) {
	repo := setupTestUserRepo(t)
	ctx := context.Background()

	err := repo.Delete(ctx, "nonexistent")
	if err != ErrUserNotFound {
		t.Errorf("Delete() error = %v, want %v", err, ErrUserNotFound)
	}
}
