package web

type CreateContainerRequest struct {
	Image string `json:"image"`
}

type ContainerCreatedResponse struct {
	Id string `json:"id"`
}
