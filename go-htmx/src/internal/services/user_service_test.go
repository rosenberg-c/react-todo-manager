package services

import (
	"context"
	"errors"
	"testing"

	"go/app/src/internal/models"
	"go/app/src/internal/repository"
)

type mockUserRepo struct {
	users map[string]models.User
}

func newMockUserRepo() *mockUserRepo {
	return &mockUserRepo{users: make(map[string]models.User)}
}

func (mock *mockUserRepo) GetAll(ctx context.Context) ([]models.User, error) {
	users := make([]models.User, 0, len(mock.users))
	for _, user := range mock.users {
		users = append(users, user)
	}
	return users, nil
}

func (mock *mockUserRepo) GetByID(
	ctx context.Context,
	id string,
) (models.User, error) {
	if user, ok := mock.users[id]; ok {
		return user, nil
	}
	return models.User{}, repository.ErrUserNotFound
}

func (mock *mockUserRepo) GetByUsername(
	ctx context.Context,
	username string,
) (models.User, error) {
	for _, user := range mock.users {
		if user.Username == username {
			return user, nil
		}
	}
	return models.User{}, repository.ErrUserNotFound
}

func (mock *mockUserRepo) Create(ctx context.Context, user models.User) error {
	mock.users[user.ID] = user
	return nil
}

func (mock *mockUserRepo) Update(ctx context.Context, user models.User) error {
	if _, ok := mock.users[user.ID]; !ok {
		return repository.ErrUserNotFound
	}
	mock.users[user.ID] = user
	return nil
}

func (mock *mockUserRepo) Delete(ctx context.Context, id string) error {
	if _, ok := mock.users[id]; !ok {
		return repository.ErrUserNotFound
	}
	delete(mock.users, id)
	return nil
}

func TestUserService_Register(t *testing.T) {
	tests := []struct {
		name        string
		username    string
		password    string
		setupRepo   func(*mockUserRepo)
		wantErr     error
		wantCreated bool
	}{
		{
			name:        "successful registration",
			username:    "newuser",
			password:    "password123",
			setupRepo:   func(m *mockUserRepo) {},
			wantErr:     nil,
			wantCreated: true,
		},
		{
			name:     "username taken",
			username: "existing",
			password: "password123",
			setupRepo: func(m *mockUserRepo) {
				m.users["existing-id"] = models.User{
					ID:       "existing-id",
					Username: "existing",
				}
			},
			wantErr:     ErrUsernameTaken,
			wantCreated: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			repo := newMockUserRepo()
			tt.setupRepo(repo)
			service := NewUserService(repo)
			ctx := context.Background()

			user, err := service.Register(ctx, tt.username, tt.password)

			if !errors.Is(err, tt.wantErr) {
				t.Errorf("Register() error = %v, want %v", err, tt.wantErr)
			}

			if tt.wantCreated {
				if user.ID == "" {
					t.Error("Register() returned empty user")
				} else if user.Username != tt.username {
					t.Errorf("Register() username = %v, want %v", user.Username, tt.username)
				}
			}
		})
	}
}

func TestUserService_Login(t *testing.T) {
	repo := newMockUserRepo()
	service := NewUserService(repo)
	ctx := context.Background()

	// Register a user first
	_, err := service.Register(ctx, "testuser", "correctpassword")
	if err != nil {
		t.Fatalf("Register() error = %v", err)
	}

	tests := []struct {
		name     string
		username string
		password string
		wantErr  error
	}{
		{
			name:     "successful login",
			username: "testuser",
			password: "correctpassword",
			wantErr:  nil,
		},
		{
			name:     "wrong password",
			username: "testuser",
			password: "wrongpassword",
			wantErr:  ErrInvalidCredentials,
		},
		{
			name:     "user not found",
			username: "nonexistent",
			password: "password",
			wantErr:  ErrInvalidCredentials,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := service.Login(ctx, tt.username, tt.password)
			if !errors.Is(err, tt.wantErr) {
				t.Errorf("Login() error = %v, want %v", err, tt.wantErr)
			}
		})
	}
}

func TestUserService_GetByID(t *testing.T) {
	repo := newMockUserRepo()
	service := NewUserService(repo)
	ctx := context.Background()

	user, _ := service.Register(ctx, "testuser", "password")

	tests := []struct {
		name    string
		id      string
		wantErr error
	}{
		{
			name:    "existing user",
			id:      user.ID,
			wantErr: nil,
		},
		{
			name:    "non-existing user",
			id:      "nonexistent",
			wantErr: ErrUserNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := service.GetByID(ctx, tt.id)
			if !errors.Is(err, tt.wantErr) {
				t.Errorf("GetByID() error = %v, want %v", err, tt.wantErr)
			}
		})
	}
}
