package web

import (
	"encoding/json"
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
	api.registerRoutes()

	fileServer(api.router, "/", http.Dir("public"))

	return api
}

func (api *VesaApi) ServeHTTP(port string) {
	fmt.Println("Listening on port :" + port)
	log.Fatal(http.ListenAndServe(":"+port, api.router))
}

func (api *VesaApi) registerRoutes() {
	api.router.Get("/api/containers", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.dockerctrl.GetContainers()
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	api.router.Post("/api/containers", func(w http.ResponseWriter, r *http.Request) {
		req := &dockerctrl.RunContainerRequest{}
		err := json.NewDecoder(r.Body).Decode(req)
		if err != nil {
			handleError(w, err)
			return
		}

		err = validate.Struct(req)
		if err != nil {
			validationError(w, err)
			return
		}

		id, err := api.dockerctrl.RunContainer(*req)
		if err != nil {
			handleError(w, err)
			return
		}

		res := &ContainerCreatedResponse{Id: id}

		w.WriteHeader(http.StatusCreated)
		sendJson(w, res)
	})

	api.router.Delete("/api/containers/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		err := api.dockerctrl.DeleteContainer(id)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	api.router.Post("/api/containers/{id}/stop", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		err := api.dockerctrl.StopContainer(id)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	api.router.Post("/api/containers/{id}/start", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		err := api.dockerctrl.StartContainer(id)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})
}
