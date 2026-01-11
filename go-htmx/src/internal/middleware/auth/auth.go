package middleware

import (
	"context"
	"net/http"

	"go/app/src/internal/routes"

	"github.com/gorilla/sessions"
)

type contextKey string

const (
	sessionName      = "session"
	userIDKey        = "user_id"
	UserIDContextKey = contextKey("userID")
)

// UserValidator checks if a user exists
type UserValidator interface {
	Exists(userID string) bool
}

type AuthMiddleware struct {
	store         *sessions.CookieStore
	userValidator UserValidator
}

func NewAuthMiddleware(
	secretKey string,
	userValidator UserValidator,
) *AuthMiddleware {
	store := sessions.NewCookieStore([]byte(secretKey))
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7, // 7 days
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
	return &AuthMiddleware{store: store, userValidator: userValidator}
}

func (auth *AuthMiddleware) SetUserID(
	writer http.ResponseWriter,
	request *http.Request,
	userID string,
) error {
	// Ignore decode errors from invalid existing cookies - we get a fresh
	// session anyway and will overwrite the cookie.
	session, _ := auth.store.Get(request, sessionName)
	session.Values[userIDKey] = userID
	return session.Save(request, writer)
}

func (auth *AuthMiddleware) GetUserID(request *http.Request) string {
	// Ignore decode errors from corrupted cookies - treat as unauthenticated
	session, _ := auth.store.Get(request, sessionName)
	if session == nil {
		return ""
	}
	userID, ok := session.Values[userIDKey].(string)
	if !ok || userID == "" {
		return ""
	}
	return userID
}

func (auth *AuthMiddleware) ClearSession(
	writer http.ResponseWriter,
	request *http.Request,
) error {
	// Ignore decode errors - we're clearing the session anyway.
	session, _ := auth.store.Get(request, sessionName)
	session.Options.MaxAge = -1
	return session.Save(request, writer)
}

func (auth *AuthMiddleware) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(
		func(writer http.ResponseWriter, request *http.Request) {
			userID := auth.GetUserID(request)
			if userID == "" {
				http.Redirect(writer, request, routes.Login, http.StatusFound)
				return
			}
			// Validate user still exists in database
			if auth.userValidator != nil && !auth.userValidator.Exists(userID) {
				auth.ClearSession(writer, request)
				http.Redirect(writer, request, routes.Login, http.StatusFound)
				return
			}
			parentCtx := request.Context()
			ctx := context.WithValue(
				parentCtx,
				UserIDContextKey,
				userID,
			)
			next.ServeHTTP(writer, request.WithContext(ctx))
		},
	)
}

func (auth *AuthMiddleware) RedirectIfAuthenticated(
	next http.Handler,
) http.Handler {
	return http.HandlerFunc(
		func(writer http.ResponseWriter, request *http.Request) {
			userID := auth.GetUserID(request)
			if userID != "" {
				// Validate user still exists before redirecting to home
				if auth.userValidator != nil &&
					!auth.userValidator.Exists(userID) {
					auth.ClearSession(writer, request)
					next.ServeHTTP(writer, request)
					return
				}
				http.Redirect(writer, request, routes.Home, http.StatusFound)
				return
			}
			next.ServeHTTP(writer, request)
		},
	)
}

func GetUserIDFromContext(ctx context.Context) string {
	userID, ok := ctx.Value(UserIDContextKey).(string)
	if !ok {
		return ""
	}
	return userID
}
