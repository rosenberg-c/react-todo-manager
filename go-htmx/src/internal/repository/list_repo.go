package repository

import (
	"context"
	"fmt"
	"sync"

	"go/app/src/internal/models"
)

// JSONListRepository implements ListRepository using JSON file storage.
type JSONListRepository struct {
	store Store
	mu    sync.RWMutex
}

// NewJSONListRepository creates a new JSONListRepository with the provided store.
func NewJSONListRepository(store Store) *JSONListRepository {
	return &JSONListRepository{
		store: store,
	}
}

func (repo *JSONListRepository) GetAll(
	ctx context.Context,
) ([]models.List, error) {
	repo.mu.RLock()
	defer repo.mu.RUnlock()
	return repo.loadAll(ctx)
}

func (repo *JSONListRepository) loadAll(
	ctx context.Context,
) ([]models.List, error) {
	var lists []models.List
	if err := repo.store.Load(ctx, &lists); err != nil {
		return nil, fmt.Errorf("could not load lists: %w", err)
	}
	return lists, nil
}

func (repo *JSONListRepository) GetByID(
	ctx context.Context,
	id string,
) (models.List, error) {
	repo.mu.RLock()
	defer repo.mu.RUnlock()

	lists, err := repo.loadAll(ctx)
	if err != nil {
		return models.List{}, fmt.Errorf("could not get list by ID: %w", err)
	}

	for i := range lists {
		if lists[i].ID == id {
			return lists[i], nil
		}
	}
	return models.List{}, ErrListNotFound
}

func (repo *JSONListRepository) GetByUserID(
	ctx context.Context,
	userID string,
) ([]models.List, error) {
	repo.mu.RLock()
	defer repo.mu.RUnlock()

	lists, err := repo.loadAll(ctx)
	if err != nil {
		return nil, fmt.Errorf("could not get lists by user ID: %w", err)
	}

	var userLists []models.List
	for _, list := range lists {
		if list.UserID == userID {
			userLists = append(userLists, list)
		}
	}
	return userLists, nil
}

func (repo *JSONListRepository) Create(
	ctx context.Context,
	list models.List,
) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	lists, err := repo.loadAll(ctx)
	if err != nil {
		return fmt.Errorf("could not create list: %w", err)
	}

	for i := range lists {
		if lists[i].ID == list.ID {
			return ErrListAlreadyExists
		}
	}

	lists = append(lists, list)
	if err := repo.store.Save(ctx, lists); err != nil {
		return fmt.Errorf("could not save list: %w", err)
	}
	return nil
}

func (repo *JSONListRepository) Update(
	ctx context.Context,
	list models.List,
) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	lists, err := repo.loadAll(ctx)
	if err != nil {
		return fmt.Errorf("could not update list: %w", err)
	}

	for index, existing := range lists {
		if existing.ID == list.ID {
			lists[index] = list
			if err := repo.store.Save(ctx, lists); err != nil {
				return fmt.Errorf("could not save list: %w", err)
			}
			return nil
		}
	}
	return ErrListNotFound
}

func (repo *JSONListRepository) Delete(ctx context.Context, id string) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	lists, err := repo.loadAll(ctx)
	if err != nil {
		return fmt.Errorf("could not delete list: %w", err)
	}

	for index, list := range lists {
		if list.ID == id {
			lists = append(lists[:index], lists[index+1:]...)
			if err := repo.store.Save(ctx, lists); err != nil {
				return fmt.Errorf("could not save lists: %w", err)
			}
			return nil
		}
	}
	return ErrListNotFound
}
