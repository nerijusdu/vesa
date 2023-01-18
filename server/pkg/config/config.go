package config

import (
	"encoding/json"
	"errors"
	"os"
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
	dirname, err := os.UserHomeDir()
	if err != nil {
		panic(err)
	}

	configPath := dirname + "/.config/vesa/config.json"
	if fileExists(configPath) {
		return readConfig(configPath)
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

	writeConfig(defaultConfig, configPath)

	return defaultConfig
}

func readConfig(configPath string) *Config {
	f, err := os.Open(configPath)
	if err != nil {
		panic(err)
	}
	defer f.Close()

	var config Config
	if err := json.NewDecoder(f).Decode(&config); err != nil {
		panic(err)
	}

	return &config
}

func writeConfig(config *Config, configPath string) {
	os.MkdirAll(configPath[:len(configPath)-len("config.json")], 0755)
	f, err := os.Create(configPath)
	if err != nil {
		panic(err)
	}
	defer f.Close()

	if err := json.NewEncoder(f).Encode(config); err != nil {
		panic(err)
	}
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return false
		}
		panic(err)
	}

	return true
}
