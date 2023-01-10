package dockerctrl

import (
	"github.com/docker/docker/api/types"
	"github.com/nerijusdu/vesa/pkg/util"
)

func MapContainer(c types.Container) Container {
	return Container{
		ID:      c.ID,
		Names:   c.Names,
		Image:   c.Image,
		Command: c.Command,
		Created: c.Created,
		Ports:   util.Map(c.Ports, MapPort),
		Labels:  c.Labels,
		State:   c.State,
		Status:  c.Status,
	}
}

func MapPort(p types.Port) Port {
	return Port{
		IP:          p.IP,
		PrivatePort: p.PrivatePort,
		PublicPort:  p.PublicPort,
		Type:        p.Type,
	}
}
