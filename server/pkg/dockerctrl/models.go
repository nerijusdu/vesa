package dockerctrl

import "time"

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

type RunContainerRequest struct {
	Image       string   `json:"image" validate:"required"`
	Name        string   `json:"name"`
	Ports       []string `json:"ports"`
	Mounts      []Mount  `json:"mounts" validate:"dive"`
	EnvVars     []string `json:"envVars"`
	IsLocal     bool     `json:"isLocal"`
	NetworkId   string   `json:"networkId"`
	NetworkName string   `json:"networkName"`
}

type Mount struct {
	Type   string `json:"type" validate:"required,contains=bind"`
	Source string `json:"source" validate:"required"`
	Target string `json:"target" validate:"required"`
}

type Network struct {
	Name       string                      `json:"name"`
	ID         string                      `json:"id"`
	Created    time.Time                   `json:"created"`
	Scope      string                      `json:"scope"`
	Driver     string                      `json:"driver"`
	Internal   bool                        `json:"internal"`
	Attachable bool                        `json:"attachable"`
	Containers map[string]NetworkContainer `json:"containers"`
}

type NetworkContainer struct {
	Name        string `json:"name"`
	EndpointID  string `json:"endpointId"`
	MacAddress  string `json:"macAddress"`
	IPv4Address string `json:"ipv4Address"`
	IPv6Address string `json:"ipv6Address"`
}

type CreateNetworkRequest struct {
	Name       string `json:"name" validate:"required"`
	Driver     string `json:"driver"`
	Internal   bool   `json:"internal"`
	Attachable bool   `json:"attachable"`
}
