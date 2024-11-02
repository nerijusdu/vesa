package main

import (
	"embed"

	"github.com/nerijusdu/vesa/pkg/config"
	"github.com/nerijusdu/vesa/pkg/data"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
	"github.com/nerijusdu/vesa/pkg/web"
)

//go:embed public/*
var content embed.FS

//go:embed templates/*
var defaultTempaltes embed.FS

func main() {
	c := config.NewConfig()
	proj := data.NewProjectsRepository()
	templ := data.NewTemplateRepository(defaultTempaltes, c)
	auth := data.NewAuthRepository()
	apps := data.NewAppsRepository()
	traefik := data.NewTraefikRepository()
	jobs := data.NewJobsRepository()
	ctrl, err := dockerctrl.NewDockerCtrlClient(auth)
	if err != nil {
		panic(err)
	}
	defer ctrl.Close()

	api := web.NewVesaApi(web.VesaApiConfig{
		Config:        c,
		DockerCtrl:    ctrl,
		Projects:      proj,
		Templates:     templ,
		Apps:          apps,
		Traefik:       traefik,
		Jobs:          jobs,
		Auth:          auth,
		StaticContent: content,
	})

	api.ServeHTTP()
}
