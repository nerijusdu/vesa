package data

import (
	"github.com/google/uuid"
	"github.com/nerijusdu/vesa/pkg/util"
)

type AppsRepository struct {
}

func NewAppsRepository() *AppsRepository {
	if !util.FileExists("apps.json") {
		err := util.WriteFile(&Apps{Apps: []App{}}, "apps.json")
		if err != nil {
			panic(err)
		}
	}

	return &AppsRepository{}
}

func (p *AppsRepository) GetApps() ([]App, error) {
	proj, err := util.ReadFile[Apps]("apps.json")
	if err != nil {
		return nil, err
	}

	return proj.Apps, nil
}

var emptyApp = App{}

func (p *AppsRepository) GetApp(id string) (App, error) {
	apps, err := p.GetApps()
	if err != nil {
		return emptyApp, err
	}

	for _, app := range apps {
		if app.ID == id {
			return app, nil
		}
	}

	return emptyApp, nil
}

func (p *AppsRepository) SaveApp(app App) (string, error) {
	apps, err := p.GetApps()
	if err != nil {
		return "", err
	}

	if app.ID == "" {
		app.ID = uuid.NewString()
		apps = append(apps, app)
	} else {
		for i, proj := range apps {
			if proj.ID == app.ID {
				apps[i] = app
				break
			}
		}
	}

	err = util.WriteFile(&Apps{Apps: apps}, "apps.json")
	return app.ID, err
}

func (p *AppsRepository) DeleteApp(id string) error {
	apps, err := p.GetApps()
	if err != nil {
		return err
	}

	for i, app := range apps {
		if app.ID == id {
			apps = append(apps[:i], apps[i+1:]...)
			break
		}
	}

	return util.WriteFile(&Apps{Apps: apps}, "apps.json")
}
