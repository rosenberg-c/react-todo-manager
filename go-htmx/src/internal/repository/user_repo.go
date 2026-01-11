package repository

import (
	"context"
	"fmt"
	"sync"

	"go/app/src/internal/models"
)

// JSONUserRepository implements UserRepository using JSON file storage.
type JSONUserRepository struct {
	store Store
	mu    sync.RWMutex
}

// NewJSONUserRepository creates a new JSONUserRepository with the provided store.
func NewJSONUserRepository(store Store) *JSONUserRepository {
	return &JSONUserRepository{
		store: store,
	}
}

func (repo *JSONUserRepository) GetAll(
	ctx context.Context,
) ([]models.User, error) {
	repo.mu.RLock()
	defer repo.mu.RUnlock()
	return repo.loadAll(ctx)
}

func (repo *JSONUserRepository) loadAll(
	ctx context.Context,
) ([]models.User, error) {
	var users []models.User
	if err := repo.store.Load(ctx, &users); err != nil {
		return nil, fmt.Errorf("could not load users: %w", err)
	}
	return users, nil
}

func (repo *JSONUserRepository) GetByID(
	ctx context.Context,
	id string,
) (models.User, error) {
	repo.mu.RLock()
	defer repo.mu.RUnlock()

	users, err := repo.loadAll(ctx)
	if err != nil {
		return models.User{}, fmt.Errorf("could not get user by ID: %w", err)
	}

	for i := range users {
		if users[i].ID == id {
			return users[i], nil
		}
	}
	return models.User{}, ErrUserNotFound
}

func (repo *JSONUserRepository) GetByUsername(
	ctx context.Context,
	username string,
) (models.User, error) {
	repo.mu.RLock()
	defer repo.mu.RUnlock()

	users, err := repo.loadAll(ctx)
	if err != nil {
		return models.User{}, fmt.Errorf(
			"could not get user by username: %w",
			err,
		)
	}

	for i := range users {
		if users[i].Username == username {
			return users[i], nil
		}
	}
	return models.User{}, ErrUserNotFound
}

func (repo *JSONUserRepository) Create(
	ctx context.Context,
	user models.User,
) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	users, err := repo.loadAll(ctx)
	if err != nil {
		return fmt.Errorf("could not create user: %w", err)
	}

	for i := range users {
		if users[i].ID == user.ID {
			return ErrUserAlreadyExists
		}
	}

	users = append(users, user)
	if err := repo.store.Save(ctx, users); err != nil {
		return fmt.Errorf("could not save user: %w", err)
	}
	return nil
}

func (repo *JSONUserRepository) Update(
	ctx context.Context,
	user models.User,
) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	users, err := repo.loadAll(ctx)
	if err != nil {
		return fmt.Errorf("could not update user: %w", err)
	}

	for index, existing := range users {
		if existing.ID == user.ID {
			users[index] = user
			if err := repo.store.Save(ctx, users); err != nil {
				return fmt.Errorf("could not save user: %w", err)
			}
			return nil
		}
	}
	return ErrUserNotFound
}

func (repo *JSONUserRepository) Delete(ctx context.Context, id string) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	users, err := repo.loadAll(ctx)
	if err != nil {
		return fmt.Errorf("could not delete user: %w", err)
	}

	for index, user := range users {
		if user.ID == id {
			users = append(users[:index], users[index+1:]...)
			if err := repo.store.Save(ctx, users); err != nil {
				return fmt.Errorf("could not save users: %w", err)
			}
			return nil
		}
	}
	return ErrUserNotFound
}
