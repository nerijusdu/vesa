package dockerctrl

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
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

func (d *DockerCtrlClient) ListContainers() ([]types.Container, error) {
	ctx := context.Background()
	containers, err := d.Client.ContainerList(ctx, types.ContainerListOptions{})
	return containers, err
}

func (d *DockerCtrlClient) RunContainer() error {
	ctx := context.Background()
	imageName := "bfirsh/reticulate-splines"

	out, err := d.Client.ImagePull(ctx, imageName, types.ImagePullOptions{})
	if err != nil {
		return err
	}
	defer out.Close()

	io.Copy(os.Stdout, out)

	resp, err := d.Client.ContainerCreate(ctx, &container.Config{
		Image: imageName,
	}, nil, nil, nil, "")
	if err != nil {
		return err
	}

	if err := d.Client.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return err
	}

	fmt.Println(resp.ID)
	return nil
}
