package fields

const (
	ListName = "name"

	TodoTitle       = "title"
	TodoDescription = "description"
	TodoListID      = "listId"
	TodoIDs         = "todoIds"

	SortBy = "sortBy"
)

type SortOption string

const (
	SortPriority    SortOption = "priority"
	SortNewestFirst SortOption = "createdAt-desc"
	SortOldestFirst SortOption = "createdAt-asc"
	SortTitleAsc    SortOption = "title-asc"
	SortTitleDesc   SortOption = "title-desc"
	SortUpdated     SortOption = "updatedAt-desc"
)
