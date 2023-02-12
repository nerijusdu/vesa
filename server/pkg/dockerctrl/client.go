package dockerctrl

import (
	"context"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
)

type authRepository interface {
	GetFirstToken() (string, error)
}

type DockerCtrlClient struct {
	Client *client.Client
	auth   authRepository
}

func NewDockerCtrlClient(auth authRepository) (*DockerCtrlClient, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}

	return &DockerCtrlClient{
		Client: cli,
		auth:   auth,
	}, nil
}

func (d *DockerCtrlClient) Close() {
	d.Client.Close()
}

func (d *DockerCtrlClient) Authenticate(req AuthRequest) (string, error) {
	ctx := context.Background()

	res, err := d.Client.RegistryLogin(ctx, types.AuthConfig{
		Username:      req.Username,
		Password:      req.Password,
		ServerAddress: req.ServerAddress,
	})

	if err != nil {
		return "", err
	}

	return res.IdentityToken, nil
}
