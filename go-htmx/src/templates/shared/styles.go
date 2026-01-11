package shared

// Class names from forms.css
var FormClass = struct {
	FormGroup    string
	ErrorMessage string
}{
	FormGroup:    "__form-group__",
	ErrorMessage: "__error-message__",
}

// Class names from layout.css
var LayoutClass = struct {
	AuthContainer string
	AuthLink      string
	AppContent    string
}{
	AuthContainer: "__auth-container__",
	AuthLink:      "__auth-link__",
	AppContent:    "__app-content__",
}
