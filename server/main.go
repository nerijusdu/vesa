package main

import (
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
	"github.com/nerijusdu/vesa/pkg/web"
)

func main() {
	ctrl, err := dockerctrl.NewDockerCtrlClient()
	if err != nil {
		panic(err)
	}

	api := web.NewVesaApi(ctrl)

	api.ServeHTTP("8989")
}
