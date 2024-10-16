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
	IsSystem  bool                           `json:"isSystem"`
	Container dockerctrl.RunContainerRequest `json:"container"`
}

type Templates struct {
	Templates []Template `json:"templates"`
}

type Registries struct {
	Registries []RegistryAuth `json:"registries"`
}

type RegistryAuth struct {
	ServerAddress string `json:"serverAddress"`
	IdentityToken string `json:"identityToken"`
}

type App struct {
	ID     string `json:"id"`
	Name   string `json:"name" validate:"required"`
	Domain struct {
		Host        string   `json:"host" validate:"required"`
		Entrypoings []string `json:"entrypoints" validate:"required"`
	} `json:"domain" validate:"required"`
}

type Apps struct {
	Apps []App `json:"apps"`
}
