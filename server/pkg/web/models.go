package web

type CreatedResponse struct {
	Id string `json:"id"`
}

type ConnectNetworkRequest struct {
	ContainerId string `json:"containerId" validate:"required"`
}
