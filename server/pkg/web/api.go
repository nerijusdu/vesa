package web

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
)

type dockerCtrl interface {
	GetContainers() ([]dockerctrl.Container, error)
	RunContainer(image string) (string, error)
	DeleteContainer(id string) error
	StopContainer(id string) error
	StartContainer(id string) error
}

type VesaApi struct {
	router     *chi.Mux
	dockerctrl dockerCtrl
}

func NewVesaApi(dockerCtrl dockerCtrl) *VesaApi {
	api := &VesaApi{
		router:     chi.NewRouter(),
		dockerctrl: dockerCtrl,
	}

	api.router.Use(middleware.SetHeader("Access-Control-Allow-Origin", "*"))
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
		req := &CreateContainerRequest{}
		err := json.NewDecoder(r.Body).Decode(req)
		if err != nil {
			handleError(w, err)
			return
		}

		id, err := api.dockerctrl.RunContainer(req.Image)
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
