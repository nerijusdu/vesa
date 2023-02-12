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
	GetFirstToken() (string, error)
}

type VesaApi struct {
	router       chi.Router
	publicRouter chi.Router
	dockerctrl   dockerCtrlClient
	projects     projectsRepository
	templates    templateRepository
	auth         authRepository
	config       *config.Config
}

func NewVesaApi(
	dockerCtrl dockerCtrlClient,
	projects projectsRepository,
	templates templateRepository,
	auth authRepository,
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
		templates:    templates,
		auth:         auth,
		config:       c,
	}

	router.Route("/api", func(r chi.Router) {
		r.Use(oauth.Authorize(c.JWTSecret, nil))
		api.registerContainerRoutes(r)
		api.registerNetworkRoutes(r)
		api.registerProjectRoutes(r)
		api.registerTemplateRoutes(r)
	})

	fileServer(api.publicRouter, "/", staticContent)

	return api
}

func (api *VesaApi) ServeHTTP() {
	fmt.Println("Listening on port :" + api.config.Port)
	log.Fatal(http.ListenAndServe(":"+api.config.Port, api.router))
}
