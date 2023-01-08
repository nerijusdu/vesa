package main

import (
	"github.com/nerijusdu/vesa/pkg/web"
)

func main() {
	// ctrl, err := dockerctrl.NewDockerCtrlClient()
	// if err != nil {
	// 	panic(err)
	// }

	// ctrl.RunContainer()

	web.ServeFiles()
}
