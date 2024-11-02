package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/nerijusdu/vesa/pkg/data"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
)

func (api *VesaApi) registerTemplateRoutes(router chi.Router) {
	router.Get("/templates", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.templates.GetTemplates()
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	router.Get("/templates/{id}", func(w http.ResponseWriter, r *http.Request) {
		res, err := api.templates.GetTemplate(chi.URLParam(r, "id"))
		if err != nil {
			handleError(w, err)
			return
		}

		sendJson(w, res)
	})

	router.Post("/templates", func(w http.ResponseWriter, r *http.Request) {
		req := &SaveTemplateRequest{}
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

		if req.ContainerId != "" {
			c, err := api.dockerctrl.GetContainer(req.ContainerId)
			if err != nil {
				handleError(w, err)
				return
			}

			req.Container = dockerctrl.MapContainerToRequest(c)
		}

		id, err := api.templates.SaveTemplate(data.Template{
			ID:        req.Id,
			Container: req.Container,
		})
		if err != nil {
			handleError(w, err)
			return
		}

		res := &CreatedResponse{Id: id}

		w.WriteHeader(http.StatusCreated)
		sendJson(w, res)
	})

	router.Delete("/templates/{id}", func(w http.ResponseWriter, r *http.Request) {
		err := api.templates.DeleteTemplate(chi.URLParam(r, "id"))
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	router.Post("/templates/{id}/use", func(w http.ResponseWriter, r *http.Request) {
		template, err := api.templates.GetTemplate(chi.URLParam(r, "id"))
		if err != nil {
			handleError(w, err)
			return
		}

		id, err := useTemplate(api, template)
		if err != nil {
			handleError(w, err)
			return
		}

		w.WriteHeader(http.StatusCreated)
		sendJson(w, &CreatedResponse{Id: id})
	})

	router.Post("/templates/{id}/update-web", api.handleTemplateUpdate)
}

func (api *VesaApi) registerTemplateRoutesWithApiSecret(router chi.Router) {
	router.Post("/templates/{id}/update", api.handleTemplateUpdate)
}

func (api *VesaApi) handleTemplateUpdate(w http.ResponseWriter, r *http.Request) {
	template, err := api.templates.GetTemplate(chi.URLParam(r, "id"))
	if err != nil {
		handleError(w, err)
		return
	}

	tag, err := url.QueryUnescape(r.URL.Query().Get("tag"))
	if err != nil || tag == "" {
		fmt.Println("Tag cound not be identified, using latest")
		tag = "latest"
	}

	splits := strings.Split(template.Container.Image, ":")
	if len(splits) > 1 {
		// fist split is a url with port
		if strings.Contains(splits[len(splits)-1], "/") {
			splits = append(splits, tag)
		} else {
			splits[len(splits)-1] = tag
		}
	}

	template.Container.Image = strings.Join(splits, ":")
	if !template.Container.IsLocal {
		err = api.dockerctrl.PullImage(template.Container.Image)
		if err != nil {
			handleError(w, err)
			return
		}
	}

	containers, err := api.dockerctrl.GetContainers(dockerctrl.GetContainersRequest{
		Label: "template=" + template.ID,
	})
	if err != nil {
		handleError(w, err)
		return
	}

	if len(containers) > 0 {
		c := containers[0]
		err = api.dockerctrl.StopContainer(c.ID)
		if err != nil {
			handleError(w, err)
			return
		}

		err = api.dockerctrl.DeleteContainer(c.ID)
		if err != nil {
			handleError(w, err)
			return
		}
	}

	_, err = useTemplate(api, template)
	if err != nil {
		handleError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func useTemplate(api *VesaApi, template data.Template) (string, error) {
	if template.Container.Labels == nil {
		template.Container.Labels = make(map[string]string)
	}
	template.Container.Labels["template"] = template.ID

	runningContainers, err := api.dockerctrl.GetContainers(dockerctrl.GetContainersRequest{
		Label: "template=" + template.ID,
	})

	if err != nil {
		return "", err
	}

	if len(runningContainers) > 0 {
		if runningContainers[0].State != "exited" {
			err = api.dockerctrl.StopContainer(runningContainers[0].ID)
			if err != nil {
				return "", err
			}
		}

		err = api.dockerctrl.DeleteContainer(runningContainers[0].ID)
		if err != nil {
			return "", err
		}
	}

	return api.dockerctrl.RunContainer(template.Container)
}
