package listcolumn

// Class names - must match selectors in list-column.css
var Class = struct {
	ListColumn        string
	ListHeader        string
	ListHeaderActions string
	ListContent       string
	ListTitle         string
	ListTitleInput    string
	ListTodos         string
	ListEmpty         string
	SortSelect        string
	AddListButton     string
	Board             string
	SortableGhost     string
	SortableDrag      string
	TodoCard          string // from todo-card component
}{
	ListColumn:        "__list-column__",
	ListHeader:        "__list-header__",
	ListHeaderActions: "__list-header-actions__",
	ListContent:       "__list-content__",
	ListTitle:         "__list-title__",
	ListTitleInput:    "__list-title-input__",
	ListTodos:         "__list-todos__",
	ListEmpty:         "__list-empty__",
	SortSelect:        "__sort-select__",
	AddListButton:     "__add-list-button__",
	Board:             "__board__",
	SortableGhost:     "__sortable-ghost__",
	SortableDrag:      "__sortable-drag__",
	TodoCard:          "__todo-card__",
}

// ID names
var ID = struct {
	Board string
}{
	Board: "__board__",
}

// Dynamic ID builders
func ListID(id string) string {
	return "__list-" + id + "__"
}

func ListTodosTargetID(id string) string {
	return "__list-todos-target-" + id + "__"
}

func ListTodosID(id string) string {
	return "__list-todos-" + id + "__"
}

func ListTitleID(id string) string {
	return "__list-title-" + id + "__"
}
