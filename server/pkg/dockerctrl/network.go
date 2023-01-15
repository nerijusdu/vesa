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
