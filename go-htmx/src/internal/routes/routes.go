package routes

const (
	Root     = "/"
	Login    = "/login"
	Register = "/register"
	Logout   = "/logout"
	Home     = "/home"

	Health = "/health"
	Static = "/static/*"

	Lists         = "/lists"
	ListByID      = "/lists/{id}"
	ListByIDEdit  = "/lists/{id}/edit"
	ListByIDTodos = "/lists/{id}/todos"

	Todos        = "/todos"
	TodoByID     = "/todos/{id}"
	TodoByIDEdit = "/todos/{id}/edit"
	TodoByIDMove = "/todos/{id}/move"
	TodosReorder = "/todos/reorder"
)
