package dockerctrl

import (
	"github.com/docker/docker/api/types"
	"github.com/nerijusdu/vesa/pkg/util"
)

type Container struct {
	ID      string            `json:"id"`
	Names   []string          `json:"names"`
	Image   string            `json:"image"`
	Command string            `json:"command"`
	Created int64             `json:"created"`
	Ports   []Port            `json:"ports"`
	Labels  map[string]string `json:"labels"`
	State   string            `json:"state"`
	Status  string            `json:"status"`
}

type Port struct {
	IP          string `json:"ip,omitempty"`
	PrivatePort uint16 `json:"privatePort"`
	PublicPort  uint16 `json:"publicPort,omitempty"`
	Type        string `json:"type"`
}

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
