package main

import (
	"embed"

	"github.com/nerijusdu/vesa/pkg/config"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
	"github.com/nerijusdu/vesa/pkg/projects"
	"github.com/nerijusdu/vesa/pkg/util"
	"github.com/nerijusdu/vesa/pkg/web"
)

//go:embed public/*
var content embed.FS

//go:embed migrations/*
var migrations embed.FS

func main() {
	c := config.NewConfig()
	ctrl, err := dockerctrl.NewDockerCtrlClient()
	if err != nil {
		panic(err)
	}

	db := util.ConnectDB(migrations)

	proj := projects.NewProjectsRepository(db)

	api := web.NewVesaApi(ctrl, proj, c, content)

	api.ServeHTTP()
}
