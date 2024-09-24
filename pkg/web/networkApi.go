package web

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
)

func (api *VesaApi) registerNetworkRoutes(router chi.Router) {
	router.Get("/networks", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.dockerctrl.GetNetworks()
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	router.Get("/networks/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		res, err := api.dockerctrl.GetNetwork(id)
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	router.Post("/networks", func(w http.ResponseWriter, r *http.Request) {
		req := &dockerctrl.CreateNetworkRequest{}
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

		id, err := api.dockerctrl.CreateNetwork(*req)
		if err != nil {
			handleError(w, err)
			return
		}

		res := &CreatedResponse{Id: id}

		w.WriteHeader(http.StatusCreated)
		sendJson(w, res)
	})

	router.Delete("/networks/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		err := api.dockerctrl.RemoveNetwork(id)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	router.Post("/networks/{id}/connect", func(w http.ResponseWriter, r *http.Request) {
		networkId := chi.URLParam(r, "id")
		req := &ConnectNetworkRequest{}
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

		err = api.dockerctrl.ConnectNetwork(networkId, req.ContainerId)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	router.Post("/networks/{id}/disconnect", func(w http.ResponseWriter, r *http.Request) {
		networkId := chi.URLParam(r, "id")
		req := &ConnectNetworkRequest{}
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

		err = api.dockerctrl.DisconnectNetwork(networkId, req.ContainerId)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})
}
