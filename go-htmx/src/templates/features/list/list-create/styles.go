package listcreate

// Class names - must match selectors in list-create.css
var Class = struct {
	ListCreateDialog  string
	ListCreateContent string
	ListCreateActions string
	CancelBtn         string
	SubmitBtn         string
	AddListButton     string // references list-column class for hx-target
}{
	ListCreateDialog:  "__list-create-dialog__",
	ListCreateContent: "__list-create-content__",
	ListCreateActions: "__list-create-actions__",
	CancelBtn:         "__cancel-btn__",
	SubmitBtn:         "__submit-btn__",
	AddListButton:     "__add-list-button__",
}

// ID names
var ID = struct {
	ListCreateDialog string
}{
	ListCreateDialog: "__list-create-dialog__",
}
