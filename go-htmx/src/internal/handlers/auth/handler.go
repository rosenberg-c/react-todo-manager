package auth

import (
	"errors"
	"log"
	"net/http"

	"go/app/src/internal/htmx"
	authmw "go/app/src/internal/middleware/auth"
	"go/app/src/internal/routes"
	"go/app/src/internal/services"
	authfields "go/app/src/templates/components/auth-fields"
	"go/app/src/templates/pages/login"
	"go/app/src/templates/pages/register"
)

type Handler struct {
	userService *services.UserService
	auth        *authmw.AuthMiddleware
}

func NewHandler(
	userService *services.UserService,
	auth *authmw.AuthMiddleware,
) *Handler {
	return &Handler{
		userService: userService,
		auth:        auth,
	}
}

func (handler *Handler) ShowLogin(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	login.Page("").Render(ctx, writer)
}

func (handler *Handler) Login(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	username := request.FormValue(authfields.Username)
	password := request.FormValue(authfields.Password)

	user, err := handler.userService.Login(ctx, username, password)
	if err != nil {
		if errors.Is(err, services.ErrInvalidCredentials) {
			handler.renderLoginError(writer, request, Msg.InvalidCredentials)
			return
		}
		log.Printf("could not login user: %v", err)
		handler.renderLoginError(writer, request, Msg.LoginFailed)
		return
	}

	if err := handler.auth.SetUserID(writer, request, user.ID); err != nil {
		log.Printf("could not set session: %v", err)
		handler.renderLoginError(writer, request, Msg.LoginFailed)
		return
	}

	htmx.Redirect(writer, request, routes.Home)
}

func (handler *Handler) renderLoginError(
	writer http.ResponseWriter,
	request *http.Request,
	message string,
) {
	ctx := request.Context()
	if htmx.IsRequest(request) {
		login.Form(message).Render(ctx, writer)
		return
	}
	login.Page(message).Render(ctx, writer)
}

func (handler *Handler) ShowRegister(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	register.Page("").Render(ctx, writer)
}

func (handler *Handler) Register(
	writer http.ResponseWriter,
	request *http.Request,
) {
	ctx := request.Context()
	username := request.FormValue(authfields.Username)
	password := request.FormValue(authfields.Password)

	user, err := handler.userService.Register(ctx, username, password)
	if err != nil {
		if errors.Is(err, services.ErrUsernameTaken) {
			handler.renderRegisterError(writer, request, Msg.UsernameTaken)
			return
		}
		log.Printf("could not register user: %v", err)
		handler.renderRegisterError(writer, request, Msg.RegistrationFailed)
		return
	}

	if err := handler.auth.SetUserID(writer, request, user.ID); err != nil {
		log.Printf("could not set session: %v", err)
		htmx.Redirect(writer, request, routes.Login)
		return
	}

	htmx.Redirect(writer, request, routes.Home)
}

func (handler *Handler) renderRegisterError(
	writer http.ResponseWriter,
	request *http.Request,
	message string,
) {
	ctx := request.Context()
	if htmx.IsRequest(request) {
		register.Form(message).Render(ctx, writer)
		return
	}
	register.Page(message).Render(ctx, writer)
}

func (handler *Handler) Logout(
	writer http.ResponseWriter,
	request *http.Request,
) {
	if err := handler.auth.ClearSession(writer, request); err != nil {
		log.Printf("could not clear session: %v", err)
	}
	htmx.Redirect(writer, request, routes.Login)
}
