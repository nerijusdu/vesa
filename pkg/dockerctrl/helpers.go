package dockerctrl

import (
	"os"
	"strings"

	"github.com/docker/docker/api/types/mount"
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
		req.Labels["traefik.http.routers."+req.Name+".rule"] = "Host(`" + req.Domain.Host + "`)"
		for _, e := range req.Domain.Entrypoints {
			req.Labels["traefik.http.routers."+req.Name+".entrypoints"] = e
			if strings.Contains(e, "websecure") {
				req.Labels["traefik.http.routers."+req.Name+".tls.certResolver"] = "vesaresolver"
				if e == "websecure" {
					req.Labels["traefik.http.routers."+req.Name+".entrypoints.websecure.http.redirections.entryPoint.to"] = "websecure"
				}
			}
		}
	}

	return req.Labels
}
