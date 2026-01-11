package todocard

// Class names - must match selectors in todo-card.css
var Class = struct {
	TodoCard        string
	TodoCardHeader  string
	TodoCardContent string
	TodoCardActions string
	TodoTitle       string
	TodoDescription string
	TodoNoDesc      string
	TodoTitleInput  string
	TodoDescInput   string
	TodoEditActions string
	TodoSaveButton  string
}{
	TodoCard:        "__todo-card__",
	TodoCardHeader:  "__todo-card-header__",
	TodoCardContent: "__todo-card-content__",
	TodoCardActions: "__todo-card-actions__",
	TodoTitle:       "__todo-title__",
	TodoDescription: "__todo-description__",
	TodoNoDesc:      "__todo-no-description__",
	TodoTitleInput:  "__todo-title-input__",
	TodoDescInput:   "__todo-description-input__",
	TodoEditActions: "__todo-edit-actions__",
	TodoSaveButton:  "__todo-save-button__",
}

// TodoID returns the element ID for a todo card
func TodoID(id string) string {
	return "__todo-" + id + "__"
}
