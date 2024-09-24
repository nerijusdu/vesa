package config

import (
	"github.com/nerijusdu/vesa/pkg/util"
)

type Config struct {
	Port      string
	JWTSecret string
	UserName  string
	Password  string
	Clients   []Client
}

type Client struct {
	ID     string
	Secret string
}

func NewConfig() *Config {
	configFile := "config.json"
	if util.FileExists(configFile) {
		c, err := util.ReadFile[Config](configFile)
		if err != nil {
			panic(err)
		}

		return c
	}

	defaultConfig := &Config{
		Port:      "8989",
		JWTSecret: "change-me-please",
		UserName:  "user",
		Password:  "password",
		Clients: []Client{
			{
				ID:     "client",
				Secret: "secret",
			},
		},
	}

	err := util.WriteFile(defaultConfig, configFile)
	if err != nil {
		panic(err)
	}

	return defaultConfig
}
