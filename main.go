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
	proj := data.NewProjectsRepository()
	templ := data.NewTemplateRepository()
	auth := data.NewAuthRepository()
	ctrl, err := dockerctrl.NewDockerCtrlClient(auth)
	if err != nil {
		panic(err)
	}
	defer ctrl.Close()

	api := web.NewVesaApi(ctrl, proj, templ, auth, c, content)

	api.ServeHTTP()
}
