package menu

// Class names - must match selectors in menu.css
var Class = struct {
	Menu        string
	MenuBtn     string
	Dropdown    string
	Open        string
	MenuSection string
	MenuItem    string
	Divider     string
}{
	Menu:        "__menu__",
	MenuBtn:     "__menu-btn__",
	Dropdown:    "__menu-dropdown__",
	Open:        "__open__",
	MenuSection: "__menu-section__",
	MenuItem:    "__menu-item__",
	Divider:     "__menu-divider__",
}

// ID names
var ID = struct {
	Dropdown string
}{
	Dropdown: "__menu-dropdown__",
}
