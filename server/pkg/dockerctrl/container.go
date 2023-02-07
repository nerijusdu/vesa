package dockerctrl

import (
	"context"
	"io"
	"os"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/network"
	"github.com/nerijusdu/vesa/pkg/util"
)

func (d *DockerCtrlClient) GetContainers() ([]Container, error) {
	ctx := context.Background()
	containers, err := d.Client.ContainerList(ctx, types.ContainerListOptions{
		All: true,
	})
	if err != nil {
		return nil, err
	}

	res := util.Map(containers, mapContainer)
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

	if !req.IsLocal {
		out, err := d.Client.ImagePull(ctx, req.Image, types.ImagePullOptions{})
		if err != nil {
			return "", err
		}
		defer out.Close()

		io.Copy(os.Stdout, out)
	}

	ports, err := getPortMap(req.Ports)
	if err != nil {
		return "", err
	}

	portSet := getPortSet(ports)

	mounts := util.Map(req.Mounts, mapMount)
	endpoitns := map[string]*network.EndpointSettings{}

	if req.NetworkId != "" && req.NetworkName != "" {
		endpoitns[req.NetworkName] = &network.EndpointSettings{
			NetworkID: req.NetworkId,
		}
	}

	resp, err := d.Client.ContainerCreate(ctx, &container.Config{
		Image:        req.Image,
		Env:          req.EnvVars,
		ExposedPorts: portSet,
		Labels:       req.Labels,
	}, &container.HostConfig{
		RestartPolicy: mapRestartPolicy(req.RestartPolicy),
		PortBindings:  ports,
		Mounts:        mounts,
	}, &network.NetworkingConfig{
		EndpointsConfig: endpoitns,
	}, nil, req.Name)
	if err != nil {
		return "", err
	}

	if err := d.Client.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return "", err
	}

	return resp.ID, nil
}

func (d *DockerCtrlClient) GetContainer(id string) (ContainerDetails, error) {
	ctx := context.Background()
	container, err := d.Client.ContainerInspect(ctx, id)
	if err != nil {
		return ContainerDetails{}, err
	}
	return mapContainerDetails(container), nil
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

func (d *DockerCtrlClient) PullImage(image string) error {
	ctx := context.Background()
	out, err := d.Client.ImagePull(ctx, image, types.ImagePullOptions{})
	if err != nil {
		return err
	}
	defer out.Close()

	io.Copy(os.Stdout, out)
	return nil
}

func (d *DockerCtrlClient) GetContainerLogs(id string) (io.ReadCloser, error) {
	ctx := context.Background()
	return d.Client.ContainerLogs(ctx, id, types.ContainerLogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow:     true,
		Timestamps: false,
		Tail:       "100",
	})
}
