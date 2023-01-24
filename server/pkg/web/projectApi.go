package web

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
	"github.com/nerijusdu/vesa/pkg/projects"
)

func (api *VesaApi) registerProjectRoutes(router chi.Router) {
	router.Get("/projects", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.projects.GetProjects()
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	router.Get("/projects/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		res, err := api.projects.GetProject(id)
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	router.Post("/projects", func(w http.ResponseWriter, r *http.Request) {
		req := &projects.Project{}
		err := json.NewDecoder(r.Body).Decode(req)
		if err != nil {
			handleError(w, err)
			return
		}

		err = validate.Struct(req)
		if err != nil {
			handleError(w, err)
			return
		}

		if req.NetworkId == "" {
			networkId, err := api.dockerctrl.CreateNetwork(dockerctrl.CreateNetworkRequest{
				Name:   req.NetworkName,
				Driver: "bridge",
			})

			if err != nil {
				handleError(w, err)
				return
			}

			req.NetworkId = networkId
		}

		if req.NetworkName == "" {
			network, err := api.dockerctrl.GetNetwork(req.NetworkId)
			if err != nil {
				handleError(w, err)
				return
			}

			req.NetworkName = network.Name
		}

		for _, containerId := range req.Containers {
			container, err := api.dockerctrl.GetContainer(containerId)
			if err != nil {
				handleError(w, err)
				return
			}

			if _, found := container.NetworkSettings.Networks[req.NetworkName]; found {
				continue
			}

			err = api.dockerctrl.ConnectNetwork(req.NetworkId, containerId)

			if err != nil {
				handleError(w, err)
				return
			}
		}

		id, err := api.projects.SaveProject(*req)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusCreated)
		sendJson(w, &CreatedResponse{Id: id})
	})

	router.Delete("/projects/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		err := api.projects.DeleteProject(id)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	router.Post("/projects/{id}/start", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		project, err := api.projects.GetProject(id)
		if err != nil {
			handleError(w, err)
			return
		}

		for _, containerId := range project.Containers {
			err = api.dockerctrl.StartContainer(containerId)
			if err != nil {
				handleError(w, err)
				return
			}
		}

		w.WriteHeader(http.StatusNoContent)
	})

	router.Post("/projects/{id}/stop", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		project, err := api.projects.GetProject(id)
		if err != nil {
			handleError(w, err)
			return
		}

		for _, containerId := range project.Containers {
			err = api.dockerctrl.StopContainer(containerId)
			if err != nil {
				handleError(w, err)
				return
			}
		}

		w.WriteHeader(http.StatusNoContent)
	})

	router.Post("/projects/{id}/pull", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		project, err := api.projects.GetProject(id)
		if err != nil {
			handleError(w, err)
			return
		}

		for _, containerId := range project.Containers {
			container, err := api.dockerctrl.GetContainer(containerId)
			if err != nil {
				handleError(w, err)
				return
			}

			err = api.dockerctrl.PullImage(container.Config.Image)
			if err != nil {
				handleError(w, err)
				return
			}
		}

		w.WriteHeader(http.StatusNoContent)
	})
}
