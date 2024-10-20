package dockerctrl

import (
	"os"

	"github.com/docker/docker/api/types/mount"
	"github.com/nerijusdu/vesa/pkg/util"
)

func ensureMountPaths(mounts []mount.Mount) {
	for _, m := range mounts {
		if m.Type == mount.TypeBind {
			p := m.Source
			if _, err := os.Stat(p); os.IsNotExist(err) {
				os.MkdirAll(p, 0755)
			}
		}
	}
}

func addDomainLabels(req RunContainerRequest) map[string]string {
	if req.Domain.Host != "" {
		req.Labels["traefik.enable"] = "true"
		rule := util.BuildTraefikRule(req.Domain.Host, req.Domain.PathPrefix)
		req.Labels["traefik.http.routers."+req.Name+".rule"] = rule

		if req.Domain.PathPrefix != "" && req.Domain.StripPath {
			req.Labels["traefik.http.routers."+req.Name+".middlewares"] = "strip-path@file"
		}

		for _, e := range req.Domain.Entrypoints {
			req.Labels["traefik.http.routers."+req.Name+".entrypoints"] = e

			if e == "websecure" {
				req.Labels["traefik.http.routers."+req.Name+".tls.certResolver"] = "vesaresolver"
				req.Labels["traefik.http.routers."+req.Name+"-http.rule"] = rule
				req.Labels["traefik.http.routers."+req.Name+"-http.middlewares"] = "redirect-to-https@file"
				req.Labels["traefik.http.routers."+req.Name+"-http.entrypoints"] = "web"
			}
		}
	}

	return req.Labels
}
