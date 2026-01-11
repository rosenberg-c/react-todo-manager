package repository

import (
	"context"

	"go/app/src/internal/models"
)

type Store interface {
	Load(ctx context.Context, value interface{}) error
	Save(ctx context.Context, value interface{}) error
}

type UserRepository interface {
	GetAll(ctx context.Context) ([]models.User, error)
	GetByID(ctx context.Context, id string) (models.User, error)
	GetByUsername(ctx context.Context, username string) (models.User, error)
	Create(ctx context.Context, user models.User) error
	Update(ctx context.Context, user models.User) error
	Delete(ctx context.Context, id string) error
}

type ListRepository interface {
	GetAll(ctx context.Context) ([]models.List, error)
	GetByID(ctx context.Context, id string) (models.List, error)
	GetByUserID(ctx context.Context, userID string) ([]models.List, error)
	Create(ctx context.Context, list models.List) error
	Update(ctx context.Context, list models.List) error
	Delete(ctx context.Context, id string) error
}

type TodoRepository interface {
	GetAll(ctx context.Context) ([]models.Todo, error)
	GetByID(ctx context.Context, id string) (models.Todo, error)
	GetByUserID(ctx context.Context, userID string) ([]models.Todo, error)
	GetByListID(ctx context.Context, listID string) ([]models.Todo, error)
	Create(ctx context.Context, todo models.Todo) error
	Update(ctx context.Context, todo models.Todo) error
	Delete(ctx context.Context, id string) error
}
