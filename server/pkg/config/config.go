package config

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
	return &Config{
		Port:      "8989",
		JWTSecret: "secret",
		UserName:  "user01",
		Password:  "12345",
		Clients: []Client{
			{
				ID:     "abcdef",
				Secret: "12345",
			},
		},
	}
}
