package dockerctrl

import (
	"time"

	"github.com/docker/go-connections/nat"
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

type PortBinding struct {
	HostIP   string `json:"hostIp"`
	HostPort string `json:"hostPort"`
}

type ContainerDetails struct {
	ID              string           `json:"id"`
	Created         string           `json:"created"`
	Path            string           `json:"path"`
	Args            []string         `json:"args"`
	State           string           `json:"state"`
	Image           string           `json:"image"`
	Name            string           `json:"name"`
	Driver          string           `json:"driver"`
	Platform        string           `json:"platform"`
	HostConfig      *HostConfig      `json:"hostConfig"`
	NetworkSettings *NetworkSettings `json:"networkSettings"`
	Config          *ContainerConfig `json:"config"`
	Mounts          []Mount          `json:"mounts"`
}

type HostConfig struct {
	NetworkMode   string                     `json:"networkMode"`
	PortBindings  map[nat.Port][]PortBinding `json:"portBindings"`
	RestartPolicy RestartPolicy              `json:"restartPolicy"`
	AutoRemove    bool                       `json:"autoRemove"`
}

type RestartPolicy struct {
	Name              string `json:"name"`
	MaximumRetryCount int    `json:"maximumRetryCount"`
}

type NetworkSettings struct {
	Networks map[string]NetworkSettingsNetwork `json:"networks"`
}

type NetworkSettingsNetwork struct {
	NetworkID string `json:"networkId"`
}

type ContainerConfig struct {
	Env   []string `json:"env"`
	Image string   `json:"image"`
}

type RunContainerRequest struct {
	Image          string            `json:"image" validate:"required"`
	Name           string            `json:"name"`
	Command        string            `json:"command"`
	Ports          []string          `json:"ports"`
	Mounts         []Mount           `json:"mounts" validate:"dive"`
	EnvVars        []string          `json:"envVars"`
	IsLocal        bool              `json:"isLocal"`
	NetworkId      string            `json:"networkId"` // TODO: support multiple networks maybe?
	NetworkName    string            `json:"networkName"`
	SaveAsTemplate bool              `json:"saveAsTemplate"`
	RestartPolicy  RestartPolicy     `json:"restartPolicy"`
	Labels         map[string]string `json:"labels"`
	Domain         DomainConfig      `json:"domain"`
}

type GetContainersRequest struct {
	Label string `json:"label"`
}

type Mount struct {
	Type   string `json:"type" validate:"required"`
	Source string `json:"source" validate:"required"`
	Target string `json:"target" validate:"required"`
	Name   string `json:"name"`
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

type DomainConfig struct {
	Host        string   `json:"host"`
	Entrypoints []string `json:"entrypoints"`
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

type AuthRequest struct {
	Username      string `json:"username"`
	Password      string `json:"password"`
	ServerAddress string `json:"serverAddress" validate:"required"`
}

type CreateClientRequest struct {
	ClientID     string `json:"clientId" validate:"required"`
	ClientSecret string `json:"clientSecret" validate:"required"`
}
