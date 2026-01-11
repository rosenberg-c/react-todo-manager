package services

import (
	"context"
	"errors"
	"testing"

	"go/app/src/internal/models"
	"go/app/src/internal/repository"
)

type mockListRepo struct {
	lists map[string]models.List
}

func newMockListRepo() *mockListRepo {
	return &mockListRepo{lists: make(map[string]models.List)}
}

func (mock *mockListRepo) GetAll(ctx context.Context) ([]models.List, error) {
	lists := make([]models.List, 0, len(mock.lists))
	for _, list := range mock.lists {
		lists = append(lists, list)
	}
	return lists, nil
}

func (mock *mockListRepo) GetByID(
	ctx context.Context,
	id string,
) (models.List, error) {
	if list, ok := mock.lists[id]; ok {
		return list, nil
	}
	return models.List{}, repository.ErrListNotFound
}

func (mock *mockListRepo) GetByUserID(
	ctx context.Context,
	userID string,
) ([]models.List, error) {
	var lists []models.List
	for _, list := range mock.lists {
		if list.UserID == userID {
			lists = append(lists, list)
		}
	}
	return lists, nil
}

func (mock *mockListRepo) Create(ctx context.Context, list models.List) error {
	mock.lists[list.ID] = list
	return nil
}

func (mock *mockListRepo) Update(ctx context.Context, list models.List) error {
	if _, ok := mock.lists[list.ID]; !ok {
		return repository.ErrListNotFound
	}
	mock.lists[list.ID] = list
	return nil
}

func (mock *mockListRepo) Delete(ctx context.Context, id string) error {
	if _, ok := mock.lists[id]; !ok {
		return repository.ErrListNotFound
	}
	delete(mock.lists, id)
	return nil
}

func TestListService_Create(t *testing.T) {
	repo := newMockListRepo()
	service := NewListService(repo)
	ctx := context.Background()

	list, err := service.Create(ctx, "To Do", "user-1")
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	if list.Name != "To Do" {
		t.Errorf("Create() name = %v, want To Do", list.Name)
	}

	if list.UserID != "user-1" {
		t.Errorf("Create() userID = %v, want user-1", list.UserID)
	}

	if list.ID == "" {
		t.Error("Create() ID is empty")
	}
}

func TestListService_GetByUserID(t *testing.T) {
	repo := newMockListRepo()
	repo.lists["list-1"] = models.List{
		ID:     "list-1",
		Name:   "To Do",
		UserID: "user-1",
	}
	repo.lists["list-2"] = models.List{
		ID:     "list-2",
		Name:   "Done",
		UserID: "user-1",
	}
	repo.lists["list-3"] = models.List{
		ID:     "list-3",
		Name:   "Other User",
		UserID: "user-2",
	}

	service := NewListService(repo)
	ctx := context.Background()

	lists, err := service.GetByUserID(ctx, "user-1")
	if err != nil {
		t.Fatalf("GetByUserID() error = %v", err)
	}

	if len(lists) != 2 {
		t.Fatalf("GetByUserID() count = %v, want 2", len(lists))
	}
}

func TestListService_GetByID(t *testing.T) {
	repo := newMockListRepo()
	repo.lists["existing"] = models.List{
		ID:     "existing",
		Name:   "Test List",
		UserID: "user-1",
	}
	service := NewListService(repo)
	ctx := context.Background()

	testCases := []struct {
		name    string
		id      string
		wantErr error
	}{
		{
			name:    "existing list",
			id:      "existing",
			wantErr: nil,
		},
		{
			name:    "non-existing list",
			id:      "nonexistent",
			wantErr: ErrListNotFound,
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

func TestListService_Update(t *testing.T) {
	repo := newMockListRepo()
	repo.lists["existing"] = models.List{
		ID:     "existing",
		Name:   "Original",
		UserID: "user-1",
	}
	service := NewListService(repo)
	ctx := context.Background()

	testCases := []struct {
		name    string
		id      string
		newName string
		wantErr error
	}{
		{
			name:    "successful update",
			id:      "existing",
			newName: "Updated",
			wantErr: nil,
		},
		{
			name:    "not found",
			id:      "nonexistent",
			newName: "Updated",
			wantErr: ErrListNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			list, err := service.Update(ctx, testCase.id, testCase.newName)
			if !errors.Is(err, testCase.wantErr) {
				t.Errorf(
					"Update() error = %v, want %v",
					err,
					testCase.wantErr,
				)
			}

			if testCase.wantErr == nil && list.Name != testCase.newName {
				t.Errorf(
					"Update() name = %v, want %v",
					list.Name,
					testCase.newName,
				)
			}
		})
	}
}

func TestListService_Delete(t *testing.T) {
	testCases := []struct {
		name      string
		id        string
		setupRepo func(*mockListRepo)
		wantErr   error
	}{
		{
			name: "successful delete",
			id:   "existing",
			setupRepo: func(m *mockListRepo) {
				m.lists["existing"] = models.List{
					ID:     "existing",
					Name:   "Test",
					UserID: "user-1",
				}
			},
			wantErr: nil,
		},
		{
			name:      "not found",
			id:        "nonexistent",
			setupRepo: func(m *mockListRepo) {},
			wantErr:   ErrListNotFound,
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			repo := newMockListRepo()
			testCase.setupRepo(repo)
			service := NewListService(repo)
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
