package dockerctrl

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
	Image string `json:"image" validate:"required"`
	Name  string `json:"name"`
}
