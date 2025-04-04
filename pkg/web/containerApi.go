package web

import (
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"
	"net/url"

	"github.com/go-chi/chi/v5"
	"github.com/nerijusdu/vesa/pkg/config"
	"github.com/nerijusdu/vesa/pkg/data"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
	"github.com/nerijusdu/vesa/pkg/util"
)

func (api *VesaApi) registerContainerRoutes(router chi.Router) {
	router.Get("/containers", func(w http.ResponseWriter, r *http.Request) {
		label, _ := url.QueryUnescape(r.URL.Query().Get("label"))
		res, err := api.dockerctrl.GetContainers(dockerctrl.GetContainersRequest{
			Label: label,
		})
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

		var tId string
		if req.SaveAsTemplate {
			tId, err = api.templates.SaveTemplate(data.Template{Container: *req})
			if err != nil {
				handleError(w, err)
				return
			}

			if req.Labels == nil {
				req.Labels = make(map[string]string)
			}
			req.Labels["template"] = tId
		}

		id, err := api.dockerctrl.RunContainer(*req)
		if err != nil {
			if tId != "" {
				api.templates.DeleteTemplate(tId)
			}
			handleError(w, err)
			return
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

	router.Post("/containers/{id}/restart", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		err := api.dockerctrl.RestartContainer(id)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	router.Get("/containers/{id}/logs", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		reader, err := api.dockerctrl.GetContainerLogs(id)
		if err != nil {
			handleError(w, err)
			return
		}
		defer reader.Close()

		w.WriteHeader(http.StatusOK)

		header := make([]byte, 8)
		for {
			n, err := reader.Read(header)
			if err != nil {
				if err != io.EOF {
					handleError(w, err)
				}
				return
			}
			if n <= 0 {
				break
			}

			// isErr := header[0] == byte(2)
			size := uint32(header[4])<<24 |
				uint32(header[5])<<16 |
				uint32(header[6])<<8 |
				uint32(header[7])

			buf := make([]byte, size)
			n, err = reader.Read(buf)
			if err != nil {
				if err != io.EOF {
					handleError(w, err)
				}
				return
			}

			w.Write(buf)
		}
	})

	router.Post("/docker/auth", func(w http.ResponseWriter, r *http.Request) {
		req := &dockerctrl.AuthRequest{}
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

		token, err := api.dockerctrl.Authenticate(*req)
		if err != nil {
			handleError(w, err)
			return
		}

		if token == "" {
			v, err := json.Marshal(req)
			if err != nil {
				handleError(w, err)
				return
			}
			token = base64.StdEncoding.EncodeToString(v)
		}

		err = api.auth.SaveAuth(data.RegistryAuth{
			IdentityToken: token,
			ServerAddress: req.ServerAddress,
		})
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusOK)
	})

	router.Get("/docker/auth", func(w http.ResponseWriter, r *http.Request) {
		auths, err := api.auth.GetAuths()
		if err != nil {
			handleError(w, err)
			return
		}

		for i := range auths {
			auths[i].IdentityToken = ""
		}

		sendJson(w, auths)
	})

	router.Get("/settings/clients", func(w http.ResponseWriter, r *http.Request) {
		clients := []string{}
		for _, v := range api.config.Clients {
			clients = append(clients, v.ID)
		}

		sendJson(w, clients)
	})

	router.Post("/settings/clients", func(w http.ResponseWriter, r *http.Request) {
		req := &dockerctrl.CreateClientRequest{}
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

		key, err := util.HashPassword(req.ClientSecret)
		if err != nil {
			handleError(w, err)
			return
		}

		newConfig, err := config.AddClient(api.config, req.ClientID, key)
		if err != nil {
			handleError(w, err)
			return
		}

		api.config = newConfig

		w.WriteHeader(http.StatusOK)
	})

	router.Delete("/settings/clients/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		newConfig, err := config.RemoveClient(api.config, id)
		if err != nil {
			handleError(w, err)
			return
		}

		api.config = newConfig

		w.WriteHeader(http.StatusOK)
	})
}
