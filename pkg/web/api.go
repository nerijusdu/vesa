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
	"github.com/nerijusdu/vesa/pkg/runner"
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

type VesaApi struct {
	router       chi.Router
	publicRouter chi.Router
	dockerctrl   dockerCtrlClient
	projects     *data.ProjectsRepository
	templates    *data.TemplateRepository
	apps         *data.AppsRepository
	traefik      *data.TraefikRepository
	jobs         *data.JobsRepository
	runner       *runner.JobRunner
	logs         *data.LogsRepository
	auth         *data.AuthRepository
	config       *config.Config
}

type VesaApiConfig struct {
	DockerCtrl    dockerCtrlClient
	Projects      *data.ProjectsRepository
	Templates     *data.TemplateRepository
	Apps          *data.AppsRepository
	Traefik       *data.TraefikRepository
	Logs          *data.LogsRepository
	Jobs          *data.JobsRepository
	Runner        *runner.JobRunner
	Auth          *data.AuthRepository
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
		logs:         c.Logs,
		jobs:         c.Jobs,
		config:       c.Config,
		runner:       c.Runner,
	}

	router.Route("/api", func(r chi.Router) {
		r.Group(func(r chi.Router) {
			r.Use(oauth.Authorize(c.Config.JWTSecret, nil))
			api.registerContainerRoutes(r)
			api.registerNetworkRoutes(r)
			api.registerProjectRoutes(r)
			api.registerAppRoutes(r)
			api.registerTemplateRoutes(r)
			api.registerJobsRoutes(r)
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
