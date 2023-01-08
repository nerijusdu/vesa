package main

import "github.com/nerijusdu/vesa/pkg/dockerctrl"

func main() {
	ctrl, err := dockerctrl.NewDockerCtrlClient()
	if err != nil {
		panic(err)
	}

	ctrl.ListContainers()
}
