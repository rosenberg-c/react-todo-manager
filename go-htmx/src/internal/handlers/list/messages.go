package list

var Msg = struct {
	CreateFailed string
	UpdateFailed string
	DeleteFailed string
	ListNotEmpty string
	NotFound     string
}{
	CreateFailed: "Could not create list. Please try again.",
	UpdateFailed: "Could not update list. Please try again.",
	DeleteFailed: "Could not delete list. Please try again.",
	ListNotEmpty: "Cannot delete list with todos. Move or delete todos first.",
	NotFound:     "List not found.",
}
