package services

import "errors"

var (
	ErrUserNotFound       = errors.New("user not found")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUsernameTaken      = errors.New("username already taken")
	ErrListNotFound       = errors.New("list not found")
	ErrTodoNotFound       = errors.New("todo not found")
)

// var Msg = struct {
// 	ErrUserNotFound       string
// 	ErrInvalidCredentials string
// 	ErrUsernameTaken      string
// 	ErrListNotFound       string
// 	ErrTodoNotFound       string
// }{
// 	ErrUserNotFound:       "user not found",
// 	ErrInvalidCredentials: "invalid credentials",
// 	ErrUsernameTaken:      "username already taken",
// 	ErrListNotFound:       "list not found",
// 	ErrTodoNotFound:       "todo not found",
// }
