package main

import (
	"embed"

	"github.com/nerijusdu/vesa/pkg/config"
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

	api := web.NewVesaApi(ctrl, c, content)

	api.ServeHTTP()
}
