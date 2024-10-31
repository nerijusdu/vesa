package config

import (
	"fmt"
	"os"

	"github.com/charmbracelet/huh"
	"github.com/nerijusdu/vesa/pkg/util"
)

type Config struct {
	Port            string
	JWTSecret       string
	UserName        string
	Password        string
	UserEmail       string
	EnableDashboard bool
	Clients         []Client
}

type Client struct {
	ID     string
	Secret string
}

var configFile = "config.json"

func initConfig() *Config {
	values := &Config{
		JWTSecret:       util.GenerateRandomString(32),
		Clients:         []Client{},
		EnableDashboard: false,
	}

	form := huh.NewForm(
		huh.NewGroup(
			huh.NewInput().
				Title("Port").
				Description("What port to run web interface on?").
				Placeholder("8989").
				Value(&values.Port),
			huh.NewInput().
				Title("Username").
				Description("Username to login through web interface").
				Placeholder("admin").
				Validate(huh.ValidateNotEmpty()).
				Value(&values.UserName),
			huh.NewInput().
				Title("Password").
				Description("Password to login through web interface").
				Placeholder("mysupersecretpassword").
				EchoMode(huh.EchoModePassword).
				Validate(huh.ValidateNotEmpty()).
				Value(&values.Password),
			huh.NewInput().
				Title("Email").
				Description("Email to be used for generating SSL certificates with LetsEncrypt").
				Placeholder("email@example.com").
				Validate(func(val string) error {
					err := huh.ValidateNotEmpty()(val)
					if err != nil {
						return err
					}

					return util.ValidateEmail(val)
				}).
				Value(&values.UserEmail),
		),
	)

	err := form.Run()
	if err != nil {
		panic(err)
	}

	if values.Port == "" {
		values.Port = "8989"
	}

	values.Password, err = util.HashPassword(values.Password)
	if err != nil {
		panic(err)
	}

	return values
}

func NewConfig() *Config {
	isInit := len(os.Args) > 1 && os.Args[1] == "--init"
	changed := false
	var c *Config
	var err error

	if util.FileExists(configFile) {
		c, err = util.ReadFile[Config](configFile)
		if err != nil {
			panic(err)
		}
	}

	if isInit {
		newConfig := initConfig()
		if c != nil {
			newConfig.Clients = c.Clients
		}
		c = newConfig
		changed = true
	}

	if c == nil {
		panic("Config is not found, please run with --init flag")
	}

	if changed {
		err = util.WriteFile(c, configFile)
		if err != nil {
			panic(err)
		}
	}

	return c
}

func AddClient(c *Config, id, secret string) (*Config, error) {
	for _, client := range c.Clients {
		if client.ID == id {
			return c, fmt.Errorf("Client with this ID already exists")
		}
	}
	c.Clients = append(c.Clients, Client{ID: id, Secret: secret})
	err := util.WriteFile(c, configFile)
	return c, err
}

func RemoveClient(c *Config, id string) (*Config, error) {
	for i, client := range c.Clients {
		if client.ID == id {
			c.Clients = append(c.Clients[:i], c.Clients[i+1:]...)
			err := util.WriteFile(c, configFile)
			return c, err
		}
	}
	return c, nil
}
