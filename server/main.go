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

func main() {
	c := config.NewConfig()
	ctrl, err := dockerctrl.NewDockerCtrlClient()
	if err != nil {
		panic(err)
	}
	defer ctrl.Close()

	proj := data.NewProjectsRepository()
	templ := data.NewTemplateRepository()

	api := web.NewVesaApi(ctrl, proj, templ, c, content)

	api.ServeHTTP()
}
