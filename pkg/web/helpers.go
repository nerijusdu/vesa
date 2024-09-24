package web

import (
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator/v10"
)

func handleError(w http.ResponseWriter, err error) {
	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte(err.Error()))
}

func validationError(w http.ResponseWriter, err error) {
	validationErrors := err.(validator.ValidationErrors)
	w.WriteHeader(http.StatusBadRequest)
	sendJson(w, &ErrorResponse{
		Message: "Validation error",
		Type:    "validation",
		Errors:  mapValidationErrors(validationErrors),
	})
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

func mapValidationErrors(validationErrors validator.ValidationErrors) map[string]string {
	errors := make(map[string]string)
	for _, err := range validationErrors {
		errors[err.Namespace()] = err.Tag()
	}
	return errors
}
