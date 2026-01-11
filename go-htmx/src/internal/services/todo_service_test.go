package services

import (
	"context"
	"errors"
	"testing"

	"go/app/src/internal/models"
	"go/app/src/internal/repository"
)

type mockTodoRepo struct {
	todos map[string]models.Todo
}

func newMockTodoRepo() *mockTodoRepo {
	return &mockTodoRepo{todos: make(map[string]models.Todo)}
}

func (mock *mockTodoRepo) GetAll(ctx context.Context) ([]models.Todo, error) {
	todos := make([]models.Todo, 0, len(mock.todos))
	for _, todo := range mock.todos {
		todos = append(todos, todo)
	}
	return todos, nil
}

func (mock *mockTodoRepo) GetByID(
	ctx context.Context,
	id string,
) (models.Todo, error) {
	if todo, ok := mock.todos[id]; ok {
		return todo, nil
	}
	return models.Todo{}, repository.ErrTodoNotFound
}

func (mock *mockTodoRepo) GetByUserID(
	ctx context.Context,
	userID string,
) ([]models.Todo, error) {
	var todos []models.Todo
	for _, todo := range mock.todos {
		if todo.UserID == userID {
			todos = append(todos, todo)
		}
	}
	return todos, nil
}

func (mock *mockTodoRepo) GetByListID(
	ctx context.Context,
	listID string,
) ([]models.Todo, error) {
	var todos []models.Todo
	for _, todo := range mock.todos {
		if todo.ListID == listID {
			todos = append(todos, todo)
		}
	}
	return todos, nil
}

func (mock *mockTodoRepo) Create(ctx context.Context, todo models.Todo) error {
	mock.todos[todo.ID] = todo
	return nil
}

func (mock *mockTodoRepo) Update(ctx context.Context, todo models.Todo) error {
	if _, ok := mock.todos[todo.ID]; !ok {
		return repository.ErrTodoNotFound
	}
	mock.todos[todo.ID] = todo
	return nil
}

func (mock *mockTodoRepo) Delete(ctx context.Context, id string) error {
	if _, ok := mock.todos[id]; !ok {
		return repository.ErrTodoNotFound
	}
	delete(mock.todos, id)
	return nil
}

func TestTodoService_Create(t *testing.T) {
	repo := newMockTodoRepo()
	service := NewTodoService(repo)
	ctx := context.Background()

	todo, err := service.Create(
		ctx,
		"Test Todo",
		"Description",
		"list-1",
		"user-1",
	)
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	if todo.Title != "Test Todo" {
		t.Errorf("Create() title = %v, want Test Todo", todo.Title)
	}

	if todo.Description != "Description" {
		t.Errorf(
			"Create() description = %v, want Description",
			todo.Description,
		)
	}

	if todo.ListID != "list-1" {
		t.Errorf("Create() listID = %v, want list-1", todo.ListID)
	}

	if todo.UserID != "user-1" {
		t.Errorf("Create() userID = %v, want user-1", todo.UserID)
	}

	if todo.ID == "" {
		t.Error("Create() ID is empty")
	}

	if todo.Priority != 1 {
		t.Errorf("Create() priority = %v, want 1", todo.Priority)
	}
}

func TestTodoService_Create_AutoPriority(t *testing.T) {
	repo := newMockTodoRepo()
	repo.todos["existing"] = models.Todo{
		ID:       "existing",
		Title:    "Existing",
		ListID:   "list-1",
		UserID:   "user-1",
		Priority: 5,
	}

	service := NewTodoService(repo)
	ctx := context.Background()

	todo, err := service.Create(ctx, "New Todo", "", "list-1", "user-1")
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	if todo.Priority != 6 {
		t.Errorf("Create() priority = %v, want 6", todo.Priority)
	}
}

func TestTodoService_GetByUserID(t *testing.T) {
	repo := newMockTodoRepo()
	repo.todos["todo-1"] = models.Todo{
		ID:     "todo-1",
		Title:  "User1 Todo 1",
		UserID: "user-1",
	}
	repo.todos["todo-2"] = models.Todo{
		ID:     "todo-2",
		Title:  "User1 Todo 2",
		UserID: "user-1",
	}
	repo.todos["todo-3"] = models.Todo{
		ID:     "todo-3",
		Title:  "User2 Todo",
		UserID: "user-2",
	}

	service := NewTodoService(repo)
	ctx := context.Background()

	todos, err := service.GetByUserID(ctx, "user-1")
	if err != nil {
		t.Fatalf("GetByUserID() error = %v", err)
	}

	if len(todos) != 2 {
		t.Errorf("GetByUserID() count = %v, want 2", len(todos))
	}
}

func TestTodoService_GetByListID(t *testing.T) {
	repo := newMockTodoRepo()
	repo.todos["todo-1"] = models.Todo{
		ID:     "todo-1",
		Title:  "List1 Todo 1",
		ListID: "list-1",
		UserID: "user-1",
	}
	repo.todos["todo-2"] = models.Todo{
		ID:     "todo-2",
		Title:  "List1 Todo 2",
		ListID: "list-1",
		UserID: "user-1",
	}
	repo.todos["todo-3"] = models.Todo{
		ID:     "todo-3",
		Title:  "List2 Todo",
		ListID: "list-2",
		UserID: "user-1",
	}

	service := NewTodoService(repo)
	ctx := context.Background()

	todos, err := service.GetByListID(ctx, "list-1")
	if err != nil {
		t.Fatalf("GetByListID() error = %v", err)
	}

	if len(todos) != 2 {
		t.Errorf("GetByListID() count = %v, want 2", len(todos))
	}
}

func TestTodoService_GetByID(t *testing.T) {
	repo := newMockTodoRepo()
	repo.todos["existing"] = models.Todo{
		ID:     "existing",
		Title:  "Test Todo",
		UserID: "user-1",
	}
	service := NewTodoService(repo)
	ctx := context.Background()

	testCases := []struct {
		name    string
		id      string
		wantErr error
	}{
		{
			name:    "existing todo",
			id:      "existing",
			wantErr: nil,
		},
		{
			name:    "non-existing todo",
			id:      "nonexistent",
			wantErr: ErrTodoNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			_, err := service.GetByID(ctx, testCase.id)
			if !errors.Is(err, testCase.wantErr) {
				t.Errorf(
					"GetByID() error = %v, want %v",
					err,
					testCase.wantErr,
				)
			}
		})
	}
}

func TestTodoService_Update(t *testing.T) {
	repo := newMockTodoRepo()
	repo.todos["existing"] = models.Todo{
		ID:          "existing",
		Title:       "Original",
		Description: "Original desc",
		UserID:      "user-1",
	}
	service := NewTodoService(repo)
	ctx := context.Background()

	testCases := []struct {
		name        string
		id          string
		title       string
		description string
		wantErr     error
	}{
		{
			name:        "successful update",
			id:          "existing",
			title:       "Updated",
			description: "Updated desc",
			wantErr:     nil,
		},
		{
			name:        "not found",
			id:          "nonexistent",
			title:       "Updated",
			description: "",
			wantErr:     ErrTodoNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			todo, err := service.Update(
				ctx,
				testCase.id,
				testCase.title,
				testCase.description,
			)
			if !errors.Is(err, testCase.wantErr) {
				t.Errorf(
					"Update() error = %v, want %v",
					err,
					testCase.wantErr,
				)
			}

			if testCase.wantErr == nil {
				if todo.Title != testCase.title {
					t.Errorf(
						"Update() title = %v, want %v",
						todo.Title,
						testCase.title,
					)
				}
				if todo.Description != testCase.description {
					t.Errorf(
						"Update() description = %v, want %v",
						todo.Description,
						testCase.description,
					)
				}
			}
		})
	}
}

func TestTodoService_Delete(t *testing.T) {
	testCases := []struct {
		name      string
		id        string
		setupRepo func(*mockTodoRepo)
		wantErr   error
	}{
		{
			name: "successful delete",
			id:   "existing",
			setupRepo: func(m *mockTodoRepo) {
				m.todos["existing"] = models.Todo{
					ID:     "existing",
					Title:  "Test",
					UserID: "user-1",
				}
			},
			wantErr: nil,
		},
		{
			name:      "not found",
			id:        "nonexistent",
			setupRepo: func(m *mockTodoRepo) {},
			wantErr:   ErrTodoNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			repo := newMockTodoRepo()
			testCase.setupRepo(repo)
			service := NewTodoService(repo)
			ctx := context.Background()

			err := service.Delete(ctx, testCase.id)
			if !errors.Is(err, testCase.wantErr) {
				t.Errorf(
					"Delete() error = %v, want %v",
					err,
					testCase.wantErr,
				)
			}
		})
	}
}

func TestTodoService_Move(t *testing.T) {
	repo := newMockTodoRepo()
	repo.todos["todo-1"] = models.Todo{
		ID:       "todo-1",
		Title:    "Move Me",
		ListID:   "list-1",
		UserID:   "user-1",
		Priority: 1,
	}
	repo.todos["todo-2"] = models.Todo{
		ID:       "todo-2",
		Title:    "Existing in list-2",
		ListID:   "list-2",
		UserID:   "user-1",
		Priority: 3,
	}

	service := NewTodoService(repo)
	ctx := context.Background()

	testCases := []struct {
		name         string
		id           string
		newListID    string
		wantErr      error
		wantPriority int
	}{
		{
			name:         "successful move",
			id:           "todo-1",
			newListID:    "list-2",
			wantErr:      nil,
			wantPriority: 4,
		},
		{
			name:      "not found",
			id:        "nonexistent",
			newListID: "list-2",
			wantErr:   ErrTodoNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			todo, err := service.Move(ctx, testCase.id, testCase.newListID)
			if !errors.Is(err, testCase.wantErr) {
				t.Errorf(
					"Move() error = %v, want %v",
					err,
					testCase.wantErr,
				)
			}

			if testCase.wantErr == nil {
				if todo.ListID != testCase.newListID {
					t.Errorf(
						"Move() listID = %v, want %v",
						todo.ListID,
						testCase.newListID,
					)
				}
				if todo.Priority != testCase.wantPriority {
					t.Errorf(
						"Move() priority = %v, want %v",
						todo.Priority,
						testCase.wantPriority,
					)
				}
			}
		})
	}
}
