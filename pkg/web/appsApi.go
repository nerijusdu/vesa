package web

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/nerijusdu/vesa/pkg/data"
)

func (api *VesaApi) registerAppRoutes(router chi.Router) {
	router.Get("/apps", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.apps.GetApps()
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	router.Get("/apps/{id}", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.apps.GetApp(chi.URLParam(r, "id"))
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	router.Post("/apps", func(w http.ResponseWriter, r *http.Request) {
		req := &data.App{}
		err := json.NewDecoder(r.Body).Decode(req)
		if err != nil {
			handleError(w, err)
			return
		}

		err = validate.Struct(req)
		if err != nil {
			validationError(w, err)
			return
		}

		id, err := api.apps.SaveApp(*req)
		if err != nil {
			handleError(w, err)
			return
		}

		res := &CreatedResponse{Id: id}

		w.WriteHeader(http.StatusCreated)
		sendJson(w, res)
	})

	router.Delete("/apps/{id}", func(w http.ResponseWriter, r *http.Request) {
		err := api.apps.DeleteApp(chi.URLParam(r, "id"))
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

}
