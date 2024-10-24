package web

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/nerijusdu/vesa/pkg/data"
	"github.com/nerijusdu/vesa/pkg/util"
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

		rule := util.BuildTraefikRule(req.Domain.Host, req.Domain.PathPrefixes)
		middlewares := []string{}
		name := util.NormalizeName(req.Name)
		traefikConfig, err := api.traefik.GetRoutes()
		if err != nil {
			handleError(w, err)
			return
		}

		if req.Domain.StripPath && req.Domain.Host != "" {
			middlewares = append(middlewares, "strip-path")
		}

		traefikConfig.Http.Services[name] = data.TraefikService{
			LoadBalancer: data.TraefikLoadBalancer{
				Servers:        []data.TraefikServer{{URL: req.Route}},
				PassHostHeader: true,
			},
		}
		traefikConfig.Http.Routers[name] = data.TraefikRouter{
			EntryPoints: req.Domain.Entrypoings,
			Service:     name,
			Rule:        rule,
			Middlewares: middlewares,
			Tls: &data.TraefikTlsConfig{
				CertResolver: "vesaresolver",
			},
		}

		if req.Domain.Entrypoings[0] == "websecure" {
			traefikConfig.Http.Routers[name+"-http"] = data.TraefikRouter{
				EntryPoints: []string{"web"},
				Service:     name,
				Rule:        rule,
				Middlewares: []string{"redirect-to-https"},
			}
		} else {
			delete(traefikConfig.Http.Routers, name+"-http")
		}

		err = api.traefik.SaveRoutes(traefikConfig)
		if err != nil {
			handleError(w, err)
			return
		}

		res := &CreatedResponse{Id: id}

		w.WriteHeader(http.StatusCreated)
		sendJson(w, res)
	})

	router.Delete("/apps/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		app, err := api.apps.GetApp(id)
		if err != nil {
			handleError(w, err)
			return
		}

		err = api.apps.DeleteApp(id)
		if err != nil {
			handleError(w, err)
			return
		}

		traefikConfig, err := api.traefik.GetRoutes()
		name := util.NormalizeName(app.Name)
		delete(traefikConfig.Http.Routers, name)
		delete(traefikConfig.Http.Routers, name+"-http")
		delete(traefikConfig.Http.Services, name)

		err = api.traefik.SaveRoutes(traefikConfig)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})
}
