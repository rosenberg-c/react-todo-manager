package themetoggle

// Theme values
var Theme = struct {
	Light  string
	Dark   string
	System string
}{
	Light:  "light",
	Dark:   "dark",
	System: "system",
}

// ID names for theme radio buttons
var ID = struct {
	ThemeLight  string
	ThemeDark   string
	ThemeSystem string
}{
	ThemeLight:  "__theme-light__",
	ThemeDark:   "__theme-dark__",
	ThemeSystem: "__theme-system__",
}

// ThemeIDs returns a JSON map of theme values to their element IDs
func ThemeIDs() string {
	return `{"` + Theme.Light + `":"` + ID.ThemeLight + `","` + Theme.Dark + `":"` + ID.ThemeDark + `","` + Theme.System + `":"` + ID.ThemeSystem + `"}`
}
