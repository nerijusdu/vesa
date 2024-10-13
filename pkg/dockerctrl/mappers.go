package dockerctrl

import (
	"strings"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/go-connections/nat"
	"github.com/nerijusdu/vesa/pkg/util"
)

func mapContainer(c types.Container) Container {
	return Container{
		ID:      c.ID,
		Names:   c.Names,
		Image:   c.Image,
		Command: c.Command,
		Created: c.Created,
		Ports:   util.Map(c.Ports, mapPort),
		Labels:  c.Labels,
		State:   c.State,
		Status:  c.Status,
	}
}

func mapPort(p types.Port) Port {
	return Port{
		IP:          p.IP,
		PrivatePort: p.PrivatePort,
		PublicPort:  p.PublicPort,
		Type:        p.Type,
	}
}

func mapContainerDetails(c types.ContainerJSON) ContainerDetails {
	return ContainerDetails{
		ID:       c.ID,
		Created:  c.Created,
		Path:     c.Path,
		Args:     c.Args,
		State:    c.State.Status,
		Image:    c.Image,
		Name:     c.Name,
		Driver:   c.Driver,
		Platform: c.Platform,
		Mounts:   util.Map(c.Mounts, mapMountPoint),
		HostConfig: &HostConfig{
			NetworkMode:  string(c.HostConfig.NetworkMode),
			PortBindings: util.MapDict(c.HostConfig.PortBindings, mapPortBinding),
			RestartPolicy: RestartPolicy{
				Name:              c.HostConfig.RestartPolicy.Name,
				MaximumRetryCount: c.HostConfig.RestartPolicy.MaximumRetryCount,
			},
			AutoRemove: c.HostConfig.AutoRemove,
		},
		Config: &ContainerConfig{
			Env:   c.Config.Env,
			Image: c.Config.Image,
			Cmd:   c.Config.Cmd,
		},
		NetworkSettings: &NetworkSettings{
			Networks: util.MapDict(c.NetworkSettings.Networks, mapNetworkSettingsNetwork),
		},
	}
}

func mapPortBinding(p []nat.PortBinding) []PortBinding {
	return util.Map(p, func(b nat.PortBinding) PortBinding {
		return PortBinding{
			HostIP:   b.HostIP,
			HostPort: b.HostPort,
		}
	})
}

func mapNetworkSettingsNetwork(n *network.EndpointSettings) NetworkSettingsNetwork {
	return NetworkSettingsNetwork{
		NetworkID: n.NetworkID,
	}
}

func getPortMap(ports []string) (nat.PortMap, error) {
	portBindings := nat.PortMap{}
	for _, portStr := range ports {
		p, err := nat.ParsePortSpec(portStr)
		if err != nil {
			return nil, err
		}

		for _, port := range p {
			portBindings[port.Port] = []nat.PortBinding{port.Binding}
		}
	}

	return portBindings, nil
}

func getPortSet(ports nat.PortMap) nat.PortSet {
	portSet := nat.PortSet{}

	for k := range ports {
		portSet[k] = struct{}{}
	}

	return portSet
}

func mapNetwork(n types.NetworkResource) Network {
	return Network{
		ID:         n.ID,
		Name:       n.Name,
		Scope:      n.Scope,
		Created:    n.Created,
		Driver:     n.Driver,
		Internal:   n.Internal,
		Attachable: n.Attachable,
		Containers: util.MapDict(n.Containers, mapNetworkContainer),
	}
}

func mapNetworkContainer(c types.EndpointResource) NetworkContainer {
	return NetworkContainer{
		Name:        c.Name,
		EndpointID:  c.EndpointID,
		MacAddress:  c.MacAddress,
		IPv4Address: c.IPv4Address,
		IPv6Address: c.IPv6Address,
	}
}

func mapMount(m Mount) mount.Mount {
	return mount.Mount{
		Type:   mount.Type(m.Type),
		Source: m.Source,
		Target: m.Target,
	}
}

func mapMountPoint(m types.MountPoint) Mount {
	return Mount{
		Type:   string(m.Type),
		Source: m.Source,
		Target: m.Destination,
		Name:   m.Name,
	}
}

func mapRestartPolicy(m RestartPolicy) container.RestartPolicy {
	return container.RestartPolicy{
		Name:              m.Name,
		MaximumRetryCount: m.MaximumRetryCount,
	}
}

func MapContainerToRequest(m ContainerDetails) RunContainerRequest {
	name := strings.Replace(m.Name, "/", "", 1)

	networkId := ""
	for _, v := range m.NetworkSettings.Networks {
		networkId = v.NetworkID
		break
	}

	cmd := ""
	if len(m.Config.Cmd) > 0 {
		for _, c := range m.Config.Cmd {
			if len(cmd) > 0 {
				cmd += " "
			}
			if strings.Contains(c, " ") {
				cmd += "\"" + c + "\""
			} else {
				cmd += c
			}
		}
	}

	return RunContainerRequest{
		Image:         m.Config.Image,
		Name:          name,
		Ports:         getPortStrings(m.HostConfig.PortBindings),
		Mounts:        m.Mounts,
		EnvVars:       m.Config.Env,
		RestartPolicy: m.HostConfig.RestartPolicy,
		NetworkId:     networkId,
		Command:       cmd,
	}
}

func getPortStrings(m map[nat.Port][]PortBinding) []string {
	var result []string

	for k, v := range m {
		cPort := strings.Split(string(k), "/")[0]
		hPort := v[0].HostPort
		if v[0].HostIP != "" {
			hPort = v[0].HostIP + ":" + v[0].HostPort
		}
		result = append(result, hPort+":"+cPort)
	}

	return result
}
