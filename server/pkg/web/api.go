package web

import (
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/go-playground/validator/v10"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
)

var validate *validator.Validate

type dockerCtrlClient interface {
	GetContainers() ([]dockerctrl.Container, error)
	RunContainer(dockerctrl.RunContainerRequest) (string, error)
	DeleteContainer(id string) error
	StopContainer(id string) error
	StartContainer(id string) error

	GetNetworks() ([]dockerctrl.Network, error)
	GetNetwork(id string) (dockerctrl.Network, error)
}

type VesaApi struct {
	router     *chi.Mux
	dockerctrl dockerCtrlClient
}

func NewVesaApi(dockerCtrl dockerCtrlClient) *VesaApi {
	validate = validator.New()
	api := &VesaApi{
		router:     chi.NewRouter(),
		dockerctrl: dockerCtrl,
	}

	api.router.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"https://*", "http://*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		MaxAge:         300,
	}))

	api.registerContainerRoutes()
	api.registerNetworkRoutes()

	fileServer(api.router, "/", http.Dir("public"))

	return api
}

func (api *VesaApi) ServeHTTP(port string) {
	fmt.Println("Listening on port :" + port)
	log.Fatal(http.ListenAndServe(":"+port, api.router))
}
