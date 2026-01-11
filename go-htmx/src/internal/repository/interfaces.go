package repository

import (
	"context"
)

type Store interface {
	Load(ctx context.Context, value interface{}) error
	Save(ctx context.Context, value interface{}) error
}
