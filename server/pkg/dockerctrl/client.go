package dockerctrl

import (
	"context"
	"io"
	"os"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/nerijusdu/vesa/pkg/util"
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

func (d *DockerCtrlClient) GetContainers() ([]Container, error) {
	ctx := context.Background()
	containers, err := d.Client.ContainerList(ctx, types.ContainerListOptions{
		All: true,
	})
	if err != nil {
		return nil, err
	}

	res := util.Map(containers, MapContainer)
	util.Sort(res, func(a, b Container) bool {
		if a.State == b.State {
			return a.Names[0] > b.Names[0]
		}
		return a.State != "running" && b.State == "running"
	})
	return res, nil
}

func (d *DockerCtrlClient) RunContainer(req RunContainerRequest) (string, error) {
	ctx := context.Background()

	out, err := d.Client.ImagePull(ctx, req.Image, types.ImagePullOptions{})
	if err != nil {
		return "", err
	}
	defer out.Close()

	io.Copy(os.Stdout, out)

	resp, err := d.Client.ContainerCreate(ctx, &container.Config{
		Image: req.Image,
	}, nil, nil, nil, req.Name)
	if err != nil {
		return "", err
	}

	if err := d.Client.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return "", err
	}

	return resp.ID, nil
}

func (d *DockerCtrlClient) DeleteContainer(id string) error {
	ctx := context.Background()
	return d.Client.ContainerRemove(ctx, id, types.ContainerRemoveOptions{})
}

func (d *DockerCtrlClient) StopContainer(id string) error {
	ctx := context.Background()
	return d.Client.ContainerStop(ctx, id, nil)
}

func (d *DockerCtrlClient) StartContainer(id string) error {
	ctx := context.Background()
	return d.Client.ContainerStart(ctx, id, types.ContainerStartOptions{})
}
