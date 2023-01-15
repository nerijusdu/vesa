package web

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
)

func (api *VesaApi) registerContainerRoutes() {
	api.router.Get("/api/containers", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.dockerctrl.GetContainers()
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	api.router.Post("/api/containers", func(w http.ResponseWriter, r *http.Request) {
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

		res := &ContainerCreatedResponse{Id: id}

		w.WriteHeader(http.StatusCreated)
		sendJson(w, res)
	})

	api.router.Delete("/api/containers/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		err := api.dockerctrl.DeleteContainer(id)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	api.router.Post("/api/containers/{id}/stop", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		err := api.dockerctrl.StopContainer(id)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	api.router.Post("/api/containers/{id}/start", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		err := api.dockerctrl.StartContainer(id)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})
}
