package dockerctrl

import (
	"context"
	"encoding/csv"
	"io"
	"os"
	"strings"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/api/types/network"
	"github.com/nerijusdu/vesa/pkg/util"
)

func (d *DockerCtrlClient) GetContainers(req GetContainersRequest) ([]Container, error) {
	ctx := context.Background()

	var f filters.Args
	if req.Label != "" {
		f = filters.NewArgs(filters.KeyValuePair{
			Key:   "label",
			Value: req.Label,
		})
	}

	containers, err := d.Client.ContainerList(ctx, types.ContainerListOptions{
		All:     true,
		Filters: f,
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
		err := d.PullImage(req.Image)
		if err != nil {
			return "", err
		}
	}

	ports, err := getPortMap(req.Ports)
	if err != nil {
		return "", err
	}

	portSet := getPortSet(ports)

	mounts := util.Map(req.Mounts, mapMount)
	networkEndpoints := map[string]*network.EndpointSettings{}
	cmd := []string{}

	if req.Command != "" {
		r := csv.NewReader(strings.NewReader(req.Command))
		r.Comma = ' '
		cmd, err = r.Read()
		if err != nil {
			return "", err
		}
	}

	addDomainLabels(req)
	ensureMountPaths(mounts)

	if len(req.Networks) > 0 {
		// can only create container with one network
		// attach them later
		networkEndpoints[req.Networks[0].NetworkName] = &network.EndpointSettings{
			NetworkID: req.Networks[0].NetworkId,
		}
	}

	resp, err := d.Client.ContainerCreate(ctx, &container.Config{
		Image:        req.Image,
		Env:          req.EnvVars,
		ExposedPorts: portSet,
		Labels:       req.Labels,
		Cmd:          cmd,
	}, &container.HostConfig{
		RestartPolicy: mapRestartPolicy(req.RestartPolicy),
		PortBindings:  ports,
		Mounts:        mounts,
		ExtraHosts:    []string{"host.docker.internal:host-gateway"},
	}, &network.NetworkingConfig{
		EndpointsConfig: networkEndpoints,
	}, nil, req.Name)
	if err != nil {
		return "", err
	}

	if len(req.Networks) > 1 {
		for _, n := range req.Networks[1:] {
			if err := d.Client.NetworkConnect(ctx, n.NetworkId, resp.ID, nil); err != nil {
				return "", err
			}
		}
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

func (d *DockerCtrlClient) RestartContainer(id string) error {
	ctx := context.Background()
	timeout, err := time.ParseDuration("60s")
	if err != nil {
		return err
	}

	return d.Client.ContainerRestart(ctx, id, &timeout)
}

func (d *DockerCtrlClient) PullImage(image string) error {
	ctx := context.Background()

	token := ""
	splits := strings.Split(image, "/")
	if len(splits) > 0 {
		t, err := d.auth.GetToken(splits[0])
		if err != nil {
			return err
		}
		token = t
	}

	out, err := d.Client.ImagePull(ctx, image, types.ImagePullOptions{
		RegistryAuth: token,
	})
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
		Follow:     false,
		Timestamps: false,
		Tail:       "100",
	})
}
