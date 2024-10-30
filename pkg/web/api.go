package web

import (
	"embed"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/go-chi/oauth"
	"github.com/go-playground/validator/v10"
	"github.com/nerijusdu/vesa/pkg/config"
	"github.com/nerijusdu/vesa/pkg/data"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
)

var validate *validator.Validate

type dockerCtrlClient interface {
	Authenticate(req dockerctrl.AuthRequest) (string, error)

	GetContainers(req dockerctrl.GetContainersRequest) ([]dockerctrl.Container, error)
	GetContainer(id string) (dockerctrl.ContainerDetails, error)
	RunContainer(dockerctrl.RunContainerRequest) (string, error)
	DeleteContainer(id string) error
	StopContainer(id string) error
	StartContainer(id string) error
	RestartContainer(id string) error
	PullImage(image string) error
	GetContainerLogs(id string) (io.ReadCloser, error)

	GetNetworks() ([]dockerctrl.Network, error)
	GetNetwork(id string) (dockerctrl.Network, error)
	CreateNetwork(dockerctrl.CreateNetworkRequest) (string, error)
	RemoveNetwork(id string) error
	ConnectNetwork(networkID, containerID string) error
	DisconnectNetwork(networkID, containerID string) error
}

type projectsRepository interface {
	GetProjects() ([]data.Project, error)
	GetProject(id string) (data.Project, error)
	SaveProject(data.Project) (string, error)
	DeleteProject(id string) error
}

type templateRepository interface {
	GetTemplates() ([]data.Template, error)
	GetTemplate(id string) (data.Template, error)
	SaveTemplate(data.Template) (string, error)
	DeleteTemplate(id string) error
}

type authRepository interface {
	GetAuths() ([]data.RegistryAuth, error)
	SaveAuth(auth data.RegistryAuth) error
	GetToken(serverUrl string) (string, error)
}

type appsRepository interface {
	GetApps() ([]data.App, error)
	GetApp(id string) (data.App, error)
	SaveApp(data.App) (string, string, error)
	DeleteApp(id string) error
}

type traefikRepository interface {
	GetRoutes() (data.TraefikRoutesConfig, error)
	SaveRoutes(data.TraefikRoutesConfig) error
}

type VesaApi struct {
	router       chi.Router
	publicRouter chi.Router
	dockerctrl   dockerCtrlClient
	projects     projectsRepository
	templates    templateRepository
	apps         appsRepository
	traefik      traefikRepository
	auth         authRepository
	config       *config.Config
}

type VesaApiConfig struct {
	DockerCtrl    dockerCtrlClient
	Projects      projectsRepository
	Templates     templateRepository
	Apps          appsRepository
	Traefik       traefikRepository
	Auth          authRepository
	Config        *config.Config
	StaticContent embed.FS
}

func NewVesaApi(c VesaApiConfig) *VesaApi {
	validate = validator.New()
	router := chi.NewRouter()

	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "User-Agent", "Content-Type", "Accept", "Accept-Encoding", "Accept-Language", "Cache-Control", "Connection", "DNT", "Host", "Origin", "Pragma", "Referer"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	setupAuth(router, c.Config)

	api := &VesaApi{
		router:       router,
		publicRouter: router,
		dockerctrl:   c.DockerCtrl,
		projects:     c.Projects,
		templates:    c.Templates,
		traefik:      c.Traefik,
		apps:         c.Apps,
		auth:         c.Auth,
		config:       c.Config,
	}

	router.Route("/api", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			r.Use(oauth.Authorize(c.Config.JWTSecret, nil))
			api.registerContainerRoutes(r)
			api.registerNetworkRoutes(r)
			api.registerProjectRoutes(r)
			api.registerAppRoutes(r)
			api.registerTemplateRoutes(r)
		})
		r.Group(func(r chi.Router) {
			r.Use(AuthorizeApiSecret(r, c.Config))
			api.registerTemplateRoutesWithApiSecret(r)
		})
	})

	fileServer(api.publicRouter, "/", c.StaticContent)

	return api
}

func (api *VesaApi) ServeHTTP() {
	fmt.Println("Listening on port :" + api.config.Port)
	log.Fatal(http.ListenAndServe(":"+api.config.Port, api.router))
}
