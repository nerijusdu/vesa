package dockerctrl

import (
	"context"
	"fmt"

	"github.com/docker/docker/api/types"
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

func (d *DockerCtrlClient) ListContainers() {
	ctx := context.Background()
	containers, err := d.Client.ContainerList(ctx, types.ContainerListOptions{})
	if err != nil {
		panic(err)
	}

	for _, container := range containers {
		fmt.Println(container.ID)
	}
}
