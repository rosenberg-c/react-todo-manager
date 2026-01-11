package auth

var Msg = struct {
	InvalidCredentials string
	UsernameTaken      string
	RegistrationFailed string
	LoginFailed        string
}{
	InvalidCredentials: "Invalid username or password",
	UsernameTaken:      "Username is already taken",
	RegistrationFailed: "Registration failed. Please try again.",
	LoginFailed:        "Login failed. Please try again.",
}
