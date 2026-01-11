package repository

import (
	"context"
	"fmt"
	"sort"
	"sync"

	"go/app/src/internal/models"
)

// JSONTodoRepository implements TodoRepository using JSON file storage.
type JSONTodoRepository struct {
	store Store
	mu    sync.RWMutex
}

// NewJSONTodoRepository creates a new JSONTodoRepository with the provided store.
func NewJSONTodoRepository(store Store) *JSONTodoRepository {
	return &JSONTodoRepository{
		store: store,
	}
}

func (repo *JSONTodoRepository) GetAll(
	ctx context.Context,
) ([]models.Todo, error) {
	repo.mu.RLock()
	defer repo.mu.RUnlock()
	return repo.loadAll(ctx)
}

func (repo *JSONTodoRepository) loadAll(
	ctx context.Context,
) ([]models.Todo, error) {
	var todos []models.Todo
	if err := repo.store.Load(ctx, &todos); err != nil {
		return nil, fmt.Errorf("could not load todos: %w", err)
	}
	return todos, nil
}

func (repo *JSONTodoRepository) GetByID(
	ctx context.Context,
	id string,
) (models.Todo, error) {
	repo.mu.RLock()
	defer repo.mu.RUnlock()

	todos, err := repo.loadAll(ctx)
	if err != nil {
		return models.Todo{}, fmt.Errorf("could not get todo by ID: %w", err)
	}

	for i := range todos {
		if todos[i].ID == id {
			return todos[i], nil
		}
	}
	return models.Todo{}, ErrTodoNotFound
}

func (repo *JSONTodoRepository) GetByUserID(
	ctx context.Context,
	userID string,
) ([]models.Todo, error) {
	repo.mu.RLock()
	defer repo.mu.RUnlock()

	todos, err := repo.loadAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("could not get todos by user ID: %w", err)
	}

	var userTodos []models.Todo
	for _, todo := range todos {
		if todo.UserID == userID {
			userTodos = append(userTodos, todo)
		}
	}
	return userTodos, nil
}

func (repo *JSONTodoRepository) GetByListID(
	ctx context.Context,
	listID string,
) ([]models.Todo, error) {
	repo.mu.RLock()
	defer repo.mu.RUnlock()

	todos, err := repo.loadAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("could not get todos by list ID: %w", err)
	}

	var listTodos []models.Todo
	for _, todo := range todos {
		if todo.ListID == listID {
			listTodos = append(listTodos, todo)
		}
	}
	sort.Slice(listTodos, func(i, j int) bool {
		return listTodos[i].Priority < listTodos[j].Priority
	})
	return listTodos, nil
}

func (repo *JSONTodoRepository) Create(
	ctx context.Context,
	todo models.Todo,
) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	todos, err := repo.loadAll(ctx)
	if err != nil {
		return fmt.Errorf("could not create todo: %w", err)
	}

	for i := range todos {
		if todos[i].ID == todo.ID {
			return ErrTodoAlreadyExists
		}
	}

	todos = append(todos, todo)
	if err := repo.store.Save(ctx, todos); err != nil {
		return fmt.Errorf("could not save todo: %w", err)
	}
	return nil
}

func (repo *JSONTodoRepository) Update(
	ctx context.Context,
	todo models.Todo,
) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	todos, err := repo.loadAll(ctx)
	if err != nil {
		return fmt.Errorf("could not update todo: %w", err)
	}

	for index, existing := range todos {
		if existing.ID == todo.ID {
			todos[index] = todo
			if err := repo.store.Save(ctx, todos); err != nil {
				return fmt.Errorf("could not save todo: %w", err)
			}
			return nil
		}
	}
	return ErrTodoNotFound
}

func (repo *JSONTodoRepository) Delete(ctx context.Context, id string) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	todos, err := repo.loadAll(ctx)
	if err != nil {
		return fmt.Errorf("could not delete todo: %w", err)
	}

	for index, todo := range todos {
		if todo.ID == id {
			todos = append(todos[:index], todos[index+1:]...)
			if err := repo.store.Save(ctx, todos); err != nil {
				return fmt.Errorf("could not save todos: %w", err)
			}
			return nil
		}
	}
	return ErrTodoNotFound
}
