package web

import "github.com/nerijusdu/vesa/pkg/dockerctrl"

type CreatedResponse struct {
	Id string `json:"id"`
}

type ConnectNetworkRequest struct {
	ContainerId string `json:"containerId" validate:"required"`
}

type CreateTemplateRequest struct {
	Container   dockerctrl.RunContainerRequest `json:"container,omitempty" validate:"-"`
	ContainerId string                         `json:"containerId"`
}

type ErrorResponse struct {
	Message string            `json:"message"`
	Type    string            `json:"type"`
	Errors  map[string]string `json:"errors"`
}
