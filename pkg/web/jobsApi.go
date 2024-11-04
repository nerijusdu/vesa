package web

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/nerijusdu/vesa/pkg/data"
)

func (api *VesaApi) registerJobsRoutes(router chi.Router) {
	router.Get("/jobs", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.jobs.GetJobs()
		if err != nil {
			handleError(w, err)
			return
		}

		for i := range res {
			res[i].Secret = ""
		}

		sendJson(w, res)
	})

	router.Get("/jobs/{id}", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.jobs.GetJob(chi.URLParam(r, "id"))
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	router.Post("/jobs", func(w http.ResponseWriter, r *http.Request) {
		req := &data.Job{}
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

		if req.ID != "" {
			err := api.runner.RemoveJob(req.ID)
			if err != nil {
				handleError(w, err)
				return
			}
		}

		id, err := api.jobs.SaveJob(*req)
		if err != nil {
			handleError(w, err)
			return
		}

		req.ID = id

		if req.Enabled {
			err = api.runner.AddJob(*req)
			if err != nil {
				handleError(w, err)
				return
			}
		}

		sendJson(w, req)
	})

	router.Delete("/jobs/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		err := api.runner.RemoveJob(id)
		if err != nil {
			handleError(w, err)
			return
		}

		err = api.jobs.DeleteJob(id)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})
}
