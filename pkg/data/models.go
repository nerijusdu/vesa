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
	Route  string `json:"route" validate:"required"`
	Domain struct {
		Host        string   `json:"host" validate:"required"`
		PathPrefix  string   `json:"pathPrefix"`
		StripPath   bool     `json:"stripPath"`
		Entrypoings []string `json:"entrypoints" validate:"required"`
	} `json:"domain" validate:"required"`
}

type Apps struct {
	Apps []App `json:"apps"`
}

type TraefikRoutesConfig struct {
	Http TraefikHttpConfig `yaml:"http"`
}

type TraefikHttpConfig struct {
	Routers     map[string]TraefikRouter     `yaml:"routers"`
	Middlewares map[string]TraefikMiddleware `yaml:"middlewares"`
	Services    map[string]TraefikService    `yaml:"services"`
}

type TraefikRouter struct {
	EntryPoints []string          `yaml:"entryPoints"`
	Middlewares []string          `yaml:"middlewares"`
	Service     string            `yaml:"service"`
	Rule        string            `yaml:"rule"`
	Tls         *TraefikTlsConfig `yaml:"tls,omitempty"`
}

type TraefikTlsConfig struct {
	CertResolver string `yaml:"certResolver"`
}

type TraefikMiddleware struct {
	RedirectScheme *RedirectSchemeMiddleware `yaml:"redirectScheme,omitempty"`
	ReplacePath    *ReplacePathMiddleware    `yaml:"replacePath,omitempty"`
}

type RedirectSchemeMiddleware struct {
	Scheme    string `yaml:"scheme"`
	Permanent bool   `yaml:"permanent"`
}

type ReplacePathMiddleware struct {
	Path string `yaml:"path"`
}

type TraefikService struct {
	LoadBalancer TraefikLoadBalancer `yaml:"loadBalancer"`
}

type TraefikLoadBalancer struct {
	Servers        []TraefikServer `yaml:"servers"`
	PassHostHeader bool            `yaml:"passHostHeader"`
}

type TraefikServer struct {
	URL string `yaml:"url"`
}
