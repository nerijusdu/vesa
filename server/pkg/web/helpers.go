package web

import (
	"encoding/json"
	"net/http"
)

func handleError(w http.ResponseWriter, err error) {
	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte(err.Error()))
}

func sendJson(w http.ResponseWriter, data any) {
	jsonData, err := json.Marshal(data)
	if err != nil {
		handleError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}
