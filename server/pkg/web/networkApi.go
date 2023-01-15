package web

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

func (api *VesaApi) registerNetworkRoutes() {
	api.router.Get("/api/networks", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.dockerctrl.GetNetworks()
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	api.router.Get("/api/networks/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		res, err := api.dockerctrl.GetNetwork(id)
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})
}
