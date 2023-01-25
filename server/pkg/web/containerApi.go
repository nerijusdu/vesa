package web

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/nerijusdu/vesa/pkg/data"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
)

func (api *VesaApi) registerContainerRoutes(router chi.Router) {
	router.Get("/containers", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.dockerctrl.GetContainers()
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	router.Post("/containers", func(w http.ResponseWriter, r *http.Request) {
		req := &dockerctrl.RunContainerRequest{}
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

		id, err := api.dockerctrl.RunContainer(*req)
		if err != nil {
			handleError(w, err)
			return
		}

		if req.SaveAsTemplate {
			_, err = api.templates.SaveTemplate(data.Template{Container: *req})
			if err != nil {
				handleError(w, err)
				return
			}
		}

		res := &CreatedResponse{Id: id}

		w.WriteHeader(http.StatusCreated)
		sendJson(w, res)
	})

	router.Get("/containers/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		res, err := api.dockerctrl.GetContainer(id)
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	router.Delete("/containers/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		err := api.dockerctrl.DeleteContainer(id)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	router.Post("/containers/{id}/stop", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		err := api.dockerctrl.StopContainer(id)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	router.Post("/containers/{id}/start", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		err := api.dockerctrl.StartContainer(id)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})
}
