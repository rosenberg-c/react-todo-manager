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

type ListService struct {
	repo repository.ListRepository
}

func NewListService(repo repository.ListRepository) *ListService {
	return &ListService{repo: repo}
}

func (service *ListService) GetByUserID(
	ctx context.Context,
	userID string,
) ([]models.List, error) {
	lists, err := service.repo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("could not get lists: %w", err)
	}
	return lists, nil
}

func (service *ListService) GetByID(
	ctx context.Context,
	id string,
) (models.List, error) {
	list, err := service.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrListNotFound) {
			return models.List{}, ErrListNotFound
		}
		return models.List{}, fmt.Errorf("could not get list: %w", err)
	}
	return list, nil
}

func (service *ListService) Create(
	ctx context.Context,
	name string,
	userID string,
) (models.List, error) {
	list := models.List{
		ID:        uuid.New().String(),
		Name:      name,
		UserID:    userID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := service.repo.Create(ctx, list); err != nil {
		return models.List{}, fmt.Errorf("could not create list: %w", err)
	}

	return list, nil
}

func (service *ListService) Update(
	ctx context.Context,
	id string,
	name string,
) (models.List, error) {
	list, err := service.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrListNotFound) {
			return models.List{}, ErrListNotFound
		}
		return models.List{}, fmt.Errorf("could not get list: %w", err)
	}

	list.Name = name
	list.UpdatedAt = time.Now()

	if err := service.repo.Update(ctx, list); err != nil {
		return models.List{}, fmt.Errorf("could not update list: %w", err)
	}

	return list, nil
}

func (service *ListService) Delete(ctx context.Context, id string) error {
	err := service.repo.Delete(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrListNotFound) {
			return ErrListNotFound
		}
		return fmt.Errorf("could not delete list: %w", err)
	}
	return nil
}
