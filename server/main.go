package main

import (
	"github.com/nerijusdu/vesa/pkg/config"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
	"github.com/nerijusdu/vesa/pkg/web"
)

func main() {
	c := config.NewConfig()
	ctrl, err := dockerctrl.NewDockerCtrlClient()
	if err != nil {
		panic(err)
	}

	api := web.NewVesaApi(ctrl, c)

	api.ServeHTTP()
}
