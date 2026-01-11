package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go/app/src/internal/models"
	"go/app/src/internal/repository"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo repository.UserRepository
}

func NewUserService(repo repository.UserRepository) *UserService {
	return &UserService{repo: repo}
}

func (service *UserService) Register(
	ctx context.Context,
	username, password string,
) (models.User, error) {
	_, err := service.repo.GetByUsername(ctx, username)
	if err == nil {
		return models.User{}, ErrUsernameTaken
	}
	if !errors.Is(err, repository.ErrUserNotFound) {
		return models.User{}, fmt.Errorf("could not check username: %w", err)
	}

	hash, err := bcrypt.GenerateFromPassword(
		[]byte(password),
		bcrypt.DefaultCost,
	)
	if err != nil {
		return models.User{}, fmt.Errorf("could not hash password: %w", err)
	}

	user := models.User{
		ID:           uuid.New().String(),
		Username:     username,
		PasswordHash: string(hash),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := service.repo.Create(ctx, user); err != nil {
		return models.User{}, fmt.Errorf("could not create user: %w", err)
	}

	return user, nil
}

func (service *UserService) Login(
	ctx context.Context,
	username, password string,
) (models.User, error) {
	user, err := service.repo.GetByUsername(ctx, username)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return models.User{}, ErrInvalidCredentials
		}
		return models.User{}, fmt.Errorf("could not get user: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(password),
	); err != nil {
		return models.User{}, ErrInvalidCredentials
	}

	return user, nil
}

func (service *UserService) GetByID(
	ctx context.Context,
	id string,
) (models.User, error) {
	user, err := service.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrUserNotFound) {
			return models.User{}, ErrUserNotFound
		}
		return models.User{}, fmt.Errorf("could not get user: %w", err)
	}
	return user, nil
}

// Exists checks if a user with the given ID exists in the database.
// Implements middleware.UserValidator interface.
func (service *UserService) Exists(userID string) bool {
	_, err := service.repo.GetByID(context.Background(), userID)
	return err == nil
}

func (service *UserService) Delete(ctx context.Context, id string) error {
	return service.repo.Delete(ctx, id)
}
