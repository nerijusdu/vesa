package dockerctrl

import (
	"context"

	"github.com/docker/docker/api/types"
	"github.com/nerijusdu/vesa/pkg/util"
)

func (d *DockerCtrlClient) GetNetworks() ([]Network, error) {
	ctx := context.Background()
	networks, err := d.Client.NetworkList(ctx, types.NetworkListOptions{})
	if err != nil {
		return nil, err
	}

	res := util.Map(networks, mapNetwork)
	util.Sort(res, func(a, b Network) bool {
		return a.Name > b.Name
	})
	return res, nil
}

func (d *DockerCtrlClient) GetNetwork(id string) (Network, error) {
	ctx := context.Background()
	network, err := d.Client.NetworkInspect(ctx, id, types.NetworkInspectOptions{
		Verbose: true,
	})
	if err != nil {
		return Network{}, err
	}

	return mapNetwork(network), nil
}

func (d *DockerCtrlClient) CreateNetwork(req CreateNetworkRequest) (string, error) {
	ctx := context.Background()
	network, err := d.Client.NetworkCreate(ctx, req.Name, types.NetworkCreate{
		CheckDuplicate: true,
		Driver:         req.Driver,
		Internal:       req.Internal,
		Attachable:     req.Attachable,
	})
	if err != nil {
		return "", err
	}

	return network.ID, nil
}

func (d *DockerCtrlClient) RemoveNetwork(id string) error {
	ctx := context.Background()
	return d.Client.NetworkRemove(ctx, id)
}

func (d *DockerCtrlClient) ConnectNetwork(networkID, containerID string) error {
	ctx := context.Background()
	return d.Client.NetworkConnect(ctx, networkID, containerID, nil)
}

func (d *DockerCtrlClient) DisconnectNetwork(networkID, containerID string) error {
	ctx := context.Background()
	return d.Client.NetworkDisconnect(ctx, networkID, containerID, true)
}
