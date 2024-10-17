package data

import "github.com/nerijusdu/vesa/pkg/util"

type TraefikRepository struct {
}

func NewTraefikRepository() *TraefikRepository {
	if !util.FileExists("routes.yaml") {
		err := util.WriteFile(&TraefikRoutesConfig{
			Http: TraefikHttpConfig{
				Routers: make(map[string]TraefikRouter),
				Middlewares: map[string]TraefikMiddleware{
					"redirect-to-https": {
						RedirectScheme: RedirectSchemeMiddleware{
							Scheme:    "https",
							Permanent: true,
						},
					},
				},
			},
		}, "routes.yaml")
		if err != nil {
			panic(err)
		}
	}

	return &TraefikRepository{}
}

var emptyTraefikRoutesConfig = TraefikRoutesConfig{}

func (r *TraefikRepository) GetRoutes() (TraefikRoutesConfig, error) {
	c, err := util.ReadFile[TraefikRoutesConfig]("routes.yaml")
	if err != nil {
		return emptyTraefikRoutesConfig, err
	}

	return *c, nil
}

func (r *TraefikRepository) SaveRoutes(c TraefikRoutesConfig) error {
	return util.WriteFile(&c, "routes.yaml")
}
