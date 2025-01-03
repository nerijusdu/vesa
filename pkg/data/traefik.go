package data

import "github.com/nerijusdu/vesa/pkg/util"

type TraefikRepository struct {
}

var middlewares = map[string]TraefikMiddleware{
	"redirect-to-https": {
		RedirectScheme: &RedirectSchemeMiddleware{
			Scheme:    "https",
			Permanent: true,
		},
	},
}

func NewTraefikRepository() *TraefikRepository {
	repo := &TraefikRepository{}

	if !util.FileExists("routes.yaml") {
		err := util.WriteFile(&TraefikRoutesConfig{
			Http: TraefikHttpConfig{
				Middlewares: middlewares,
			},
		}, "routes.yaml")
		if err != nil {
			panic(err)
		}
	} else {
		routes, err := repo.GetRoutes()
		if err != nil {
			panic(err)
		}

		for k := range middlewares {
			if _, ok := routes.Http.Middlewares[k]; !ok {
				routes.Http.Middlewares = middlewares
				break
			}
		}

		repo.SaveRoutes(routes)
	}

	if !util.FileExists("acme_json") {
		util.CreateEmptyFile("acme_json")
	}

	return repo
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
