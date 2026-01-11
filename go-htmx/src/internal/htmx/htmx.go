package htmx

import "net/http"

const (
	HeaderRequest  = "HX-Request"
	HeaderRedirect = "HX-Redirect"
)

func IsRequest(request *http.Request) bool {
	return request.Header.Get(HeaderRequest) == "true"
}

func Redirect(writer http.ResponseWriter, request *http.Request, url string) {
	if IsRequest(request) {
		writer.Header().Set(HeaderRedirect, url)
		writer.WriteHeader(http.StatusOK)
		return
	}
	http.Redirect(writer, request, url, http.StatusFound)
}
