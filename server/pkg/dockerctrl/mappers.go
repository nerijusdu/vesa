package dockerctrl

import (
	"github.com/docker/docker/api/types"
	"github.com/docker/go-connections/nat"
	"github.com/nerijusdu/vesa/pkg/util"
)

func mapContainer(c types.Container) Container {
	return Container{
		ID:      c.ID,
		Names:   c.Names,
		Image:   c.Image,
		Command: c.Command,
		Created: c.Created,
		Ports:   util.Map(c.Ports, mapPort),
		Labels:  c.Labels,
		State:   c.State,
		Status:  c.Status,
	}
}

func mapPort(p types.Port) Port {
	return Port{
		IP:          p.IP,
		PrivatePort: p.PrivatePort,
		PublicPort:  p.PublicPort,
		Type:        p.Type,
	}
}

func mapPortBindings(ports []string) (nat.PortMap, error) {
	portBindings := nat.PortMap{}
	for _, portStr := range ports {
		p, err := nat.ParsePortSpec(portStr)
		if err != nil {
			return nil, err
		}

		for _, port := range p {
			portBindings[port.Port] = []nat.PortBinding{port.Binding}
		}
	}

	return portBindings, nil
}
