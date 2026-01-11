package repository

import "errors"

var (
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrListNotFound      = errors.New("list not found")
	ErrListAlreadyExists = errors.New("list already exists")
	ErrTodoNotFound      = errors.New("todo not found")
	ErrTodoAlreadyExists = errors.New("todo already exists")
)
