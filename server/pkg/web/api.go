package web

import (
	"embed"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/go-chi/oauth"
	"github.com/go-playground/validator/v10"
	"github.com/nerijusdu/vesa/pkg/config"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
	"github.com/nerijusdu/vesa/pkg/projects"
)

var validate *validator.Validate

type dockerCtrlClient interface {
	GetContainers() ([]dockerctrl.Container, error)
	GetContainer(id string) (dockerctrl.ContainerDetails, error)
	RunContainer(dockerctrl.RunContainerRequest) (string, error)
	DeleteContainer(id string) error
	StopContainer(id string) error
	StartContainer(id string) error

	GetNetworks() ([]dockerctrl.Network, error)
	GetNetwork(id string) (dockerctrl.Network, error)
	CreateNetwork(dockerctrl.CreateNetworkRequest) (string, error)
	RemoveNetwork(id string) error
	ConnectNetwork(networkID, containerID string) error
	DisconnectNetwork(networkID, containerID string) error
}

type projectsRepository interface {
	GetProjects() ([]projects.Project, error)
	GetProject(id string) (projects.Project, error)
	SaveProject(projects.Project) error
	DeleteProject(id string) error
}

type VesaApi struct {
	router       chi.Router
	publicRouter chi.Router
	dockerctrl   dockerCtrlClient
	projects     projectsRepository
	config       *config.Config
}

func NewVesaApi(
	dockerCtrl dockerCtrlClient,
	projects projectsRepository,
	c *config.Config,
	staticContent embed.FS,
) *VesaApi {
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

	setupAuth(router, c)

	api := &VesaApi{
		router:       router,
		publicRouter: router,
		dockerctrl:   dockerCtrl,
		projects:     projects,
		config:       c,
	}

	router.Route("/api", func(r chi.Router) {
		r.Use(oauth.Authorize(c.JWTSecret, nil))
		api.registerContainerRoutes(r)
		api.registerNetworkRoutes(r)
		api.registerProjectRoutes(r)
	})

	fileServer(api.publicRouter, "/", staticContent)

	return api
}

func (api *VesaApi) ServeHTTP() {
	fmt.Println("Listening on port :" + api.config.Port)
	log.Fatal(http.ListenAndServe(":"+api.config.Port, api.router))
}
