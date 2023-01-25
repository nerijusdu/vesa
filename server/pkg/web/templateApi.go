package web

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/nerijusdu/vesa/pkg/data"
)

func (api *VesaApi) registerTemplateRoutes(router chi.Router) {
	router.Get("/templates", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.templates.GetTemplates()
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	router.Get("/templates/{id}", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.templates.GetTemplate(chi.URLParam(r, "id"))
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	router.Post("/templates", func(w http.ResponseWriter, r *http.Request) {
		req := &data.Template{}
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

		id, err := api.templates.SaveTemplate(*req)
		if err != nil {
			handleError(w, err)
			return
		}

		res := &CreatedResponse{Id: id}

		w.WriteHeader(http.StatusCreated)
		sendJson(w, res)
	})

	router.Delete("/templates/{id}", func(w http.ResponseWriter, r *http.Request) {
		err := api.templates.DeleteTemplate(chi.URLParam(r, "id"))
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	router.Post("/templates/{id}/use", func(w http.ResponseWriter, r *http.Request) {
		template, err := api.templates.GetTemplate(chi.URLParam(r, "id"))
		if err != nil {
			handleError(w, err)
			return
		}

		id, err := api.dockerctrl.RunContainer(template.Container)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusCreated)
		sendJson(w, &CreatedResponse{Id: id})
	})
}
