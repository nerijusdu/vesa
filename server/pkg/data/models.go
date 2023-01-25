package data

import "github.com/nerijusdu/vesa/pkg/dockerctrl"

type Project struct {
	ID          string   `json:"id"`
	Name        string   `json:"name" validate:"required"`
	Containers  []string `json:"containers"`
	NetworkId   string   `json:"networkId" validate:"required_without=NetworkName"`
	NetworkName string   `json:"networkName" validate:"required_without=NetworkId"`
}

type Projects struct {
	Projects []Project `json:"projects"`
}

type Template struct {
	ID        string                         `json:"id"`
	Container dockerctrl.RunContainerRequest `json:"container"`
}

type Templates struct {
	Templates []Template `json:"templates"`
}
