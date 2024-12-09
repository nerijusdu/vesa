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

		id, oldName, err := api.apps.SaveApp(*req)
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

		if req.Domain.StripPrefix && req.Domain.Host != "" {
			middlewares = append(middlewares, "strip-prefix-"+name)
			traefikConfig.Http.Middlewares["strip-prefix-"+name] = data.TraefikMiddleware{
				StripPrefix: &data.StripPrefixMiddleware{
					Prefixes: req.Domain.PathPrefixes,
				},
			}
		} else {
			delete(traefikConfig.Http.Middlewares, "strip-prefix-"+name)
		}

		if len(req.Domain.Headers) > 0 && req.Domain.Host != "" {
			middlewares = append(middlewares, "add-headers-"+name)
			headers := make(map[string]string)
			for _, h := range req.Domain.Headers {
				headers[h.Name] = h.Value
			}
			traefikConfig.Http.Middlewares["add-headers-"+name] = data.TraefikMiddleware{
				Headers: &data.HeadersMiddleware{CustomRequestHeaders: headers},
			}
		}

		var services map[string]data.TraefikService
		if traefikConfig.Http.Services == nil {
			services = make(map[string]data.TraefikService)
		} else {
			services = *traefikConfig.Http.Services
		}

		var routers map[string]data.TraefikRouter
		if traefikConfig.Http.Routers == nil {
			routers = make(map[string]data.TraefikRouter)
		} else {
			routers = *traefikConfig.Http.Routers
		}

		services[name] = data.TraefikService{
			LoadBalancer: data.TraefikLoadBalancer{
				Servers:        []data.TraefikServer{{URL: req.Route}},
				PassHostHeader: true,
			},
		}
		webRouter := data.TraefikRouter{
			EntryPoints: req.Domain.Entrypoints,
			Service:     name,
			Rule:        rule,
			Middlewares: middlewares,
		}

		if req.Domain.Entrypoints[0] == "websecure" {
			webRouter.Tls = &data.TraefikTlsConfig{
				CertResolver: "vesaresolver",
			}
			routers[name+"-http"] = data.TraefikRouter{
				EntryPoints: []string{"web"},
				Service:     name,
				Rule:        rule,
				Middlewares: []string{"redirect-to-https"},
			}
		} else {
			delete(routers, name+"-http")
		}

		routers[name] = webRouter

		if oldName != req.Name {
			oldName = util.NormalizeName(oldName)
			delete(routers, oldName)
			delete(routers, oldName+"-http")
			delete(services, oldName)
			delete(traefikConfig.Http.Middlewares, "strip-prefix-"+oldName)
			delete(traefikConfig.Http.Middlewares, "add-headers-"+oldName)
		}

		traefikConfig.Http.Routers = &routers
		traefikConfig.Http.Services = &services

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
		routers := *traefikConfig.Http.Routers
		services := *traefikConfig.Http.Services
		name := util.NormalizeName(app.Name)
		if routers != nil {
			delete(routers, name)
			delete(routers, name+"-http")
		}
		if services != nil {
			delete(services, name)
		}
		delete(traefikConfig.Http.Middlewares, "strip-prefix-"+name)
		delete(traefikConfig.Http.Middlewares, "add-headers-"+name)

		err = api.traefik.SaveRoutes(traefikConfig)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})
}
