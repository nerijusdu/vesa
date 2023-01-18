package web

type CreatedResponse struct {
	Id string `json:"id"`
}

type ConnectNetworkRequest struct {
	ContainerId string `json:"containerId" validate:"required"`
}

type ErrorResponse struct {
	Message string            `json:"message"`
	Type    string            `json:"type"`
	Errors  map[string]string `json:"errors"`
}
