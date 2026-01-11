package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go/app/src/internal/models"
	"go/app/src/internal/repository"

	"github.com/google/uuid"
)

type TodoService struct {
	repo repository.TodoRepository
}

func NewTodoService(repo repository.TodoRepository) *TodoService {
	return &TodoService{repo: repo}
}

func (service *TodoService) GetByUserID(
	ctx context.Context,
	userID string,
) ([]models.Todo, error) {
	todos, err := service.repo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("could not get todos: %w", err)
	}
	return todos, nil
}

func (service *TodoService) GetByListID(
	ctx context.Context,
	listID string,
) ([]models.Todo, error) {
	todos, err := service.repo.GetByListID(ctx, listID)
	if err != nil {
		return nil, fmt.Errorf("could not get todos: %w", err)
	}
	return todos, nil
}

func (service *TodoService) GetByID(
	ctx context.Context,
	id string,
) (models.Todo, error) {
	todo, err := service.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrTodoNotFound) {
			return models.Todo{}, ErrTodoNotFound
		}
		return models.Todo{}, fmt.Errorf("could not get todo: %w", err)
	}
	return todo, nil
}

func (service *TodoService) Create(
	ctx context.Context,
	title string,
	description string,
	listID string,
	userID string,
) (models.Todo, error) {
	priority, err := service.nextPriority(ctx, listID)
	if err != nil {
		return models.Todo{}, err
	}

	todo := models.Todo{
		ID:          uuid.New().String(),
		Title:       title,
		Description: description,
		ListID:      listID,
		Priority:    priority,
		UserID:      userID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := service.repo.Create(ctx, todo); err != nil {
		return models.Todo{}, fmt.Errorf("could not create todo: %w", err)
	}

	return todo, nil
}

func (service *TodoService) Update(
	ctx context.Context,
	id string,
	title string,
	description string,
) (models.Todo, error) {
	todo, err := service.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrTodoNotFound) {
			return models.Todo{}, ErrTodoNotFound
		}
		return models.Todo{}, fmt.Errorf("could not get todo: %w", err)
	}

	todo.Title = title
	todo.Description = description
	todo.UpdatedAt = time.Now()

	if err := service.repo.Update(ctx, todo); err != nil {
		return models.Todo{}, fmt.Errorf("could not update todo: %w", err)
	}

	return todo, nil
}

func (service *TodoService) Delete(ctx context.Context, id string) error {
	err := service.repo.Delete(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrTodoNotFound) {
			return ErrTodoNotFound
		}
		return fmt.Errorf("could not delete todo: %w", err)
	}
	return nil
}

func (service *TodoService) Move(
	ctx context.Context,
	id string,
	listID string,
) (models.Todo, error) {
	todo, err := service.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrTodoNotFound) {
			return models.Todo{}, ErrTodoNotFound
		}
		return models.Todo{}, fmt.Errorf("could not get todo: %w", err)
	}

	priority, err := service.nextPriority(ctx, listID)
	if err != nil {
		return models.Todo{}, err
	}

	todo.ListID = listID
	todo.Priority = priority
	todo.UpdatedAt = time.Now()

	if err := service.repo.Update(ctx, todo); err != nil {
		return models.Todo{}, fmt.Errorf("could not update todo: %w", err)
	}

	return todo, nil
}

func (service *TodoService) Reorder(
	ctx context.Context,
	todoIDs []string,
) error {
	for priority, id := range todoIDs {
		todo, err := service.repo.GetByID(ctx, id)
		if err != nil {
			if errors.Is(err, repository.ErrTodoNotFound) {
				return ErrTodoNotFound
			}
			return fmt.Errorf("could not get todo: %w", err)
		}

		todo.Priority = priority + 1
		todo.UpdatedAt = time.Now()

		if err := service.repo.Update(ctx, todo); err != nil {
			return fmt.Errorf("could not update todo priority: %w", err)
		}
	}
	return nil
}

func (service *TodoService) nextPriority(
	ctx context.Context,
	listID string,
) (int, error) {
	todos, err := service.repo.GetByListID(ctx, listID)
	if err != nil {
		return 0, fmt.Errorf("could not get todos for priority: %w", err)
	}

	maxPriority := 0
	for _, todo := range todos {
		if todo.Priority > maxPriority {
			maxPriority = todo.Priority
		}
	}
	return maxPriority + 1, nil
}
