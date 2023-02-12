package web

import (
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"net/http"
	"net/url"

	"github.com/go-chi/chi/v5"
	"github.com/nerijusdu/vesa/pkg/data"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
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

	router.Get("/containers/{id}/logs", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		reader, err := api.dockerctrl.GetContainerLogs(id)
		if err != nil {
			handleError(w, err)
			return
		}
		defer reader.Close()

		reqCtx := r.Context()
		flusher, ok := w.(http.Flusher)
		if !ok {
			handleError(w, err)
			return
		}

		w.Header().Set("Transfer-Encoding", "chunked")
		w.WriteHeader(http.StatusOK)
		flusher.Flush()

		hBytes := make([]byte, 8)
		buf := make([]byte, 1024)
		for {
			select {
			case <-reqCtx.Done():
				return
			default:
				_, err := reader.Read(hBytes)
				if err != nil {
					handleError(w, err)
					return
				}

				frameSize := int(binary.BigEndian.Uint32(hBytes[4:8]))
				if frameSize > len(buf) {
					buf = append(buf, make([]byte, frameSize+len(buf)+1)...)
				}
				_, err = reader.Read(buf[:frameSize])

				w.Write(buf[:frameSize])
				flusher.Flush()
			}
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

		for _, v := range auths {
			v.IdentityToken = ""
		}

		sendJson(w, auths)
	})
}
