package dockerctrl

import (
	"os"
	"strings"

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
		rule := util.BuildTraefikRule(req.Domain.Host, req.Domain.PathPrefixes)
		req.Labels["traefik.http.routers."+req.Name+".rule"] = rule

		if len(req.Domain.PathPrefixes) > 0 && req.Domain.StripPrefix {
			req.Labels["traefik.http.routers."+req.Name+".middlewares"] = "strip-prefix-" + req.Name
			req.Labels["traefik.http.middlewares.strip-prefix-"+req.Name+".stripprefix.prefixes"] = strings.Join(req.Domain.PathPrefixes, ",")
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
