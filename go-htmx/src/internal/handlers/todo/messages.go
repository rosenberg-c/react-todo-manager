package todo

var Msg = struct {
	CreateFailed  string
	UpdateFailed  string
	DeleteFailed  string
	MoveFailed    string
	ReorderFailed string
	NotFound      string
}{
	CreateFailed:  "Could not create todo. Please try again.",
	UpdateFailed:  "Could not update todo. Please try again.",
	DeleteFailed:  "Could not delete todo. Please try again.",
	MoveFailed:    "Could not move todo. Please try again.",
	ReorderFailed: "Could not reorder todos. Please try again.",
	NotFound:      "Todo not found.",
}
