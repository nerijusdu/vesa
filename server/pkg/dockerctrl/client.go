package dockerctrl

import (
	"github.com/docker/docker/client"
)

type DockerCtrlClient struct {
	*client.Client
}

func NewDockerCtrlClient() (*DockerCtrlClient, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	return &DockerCtrlClient{cli}, nil
}

func (d *DockerCtrlClient) Close() {
	d.Client.Close()
}
