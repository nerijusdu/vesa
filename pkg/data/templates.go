package data

import (
	"embed"
	"encoding/json"
	"strings"

	"github.com/google/uuid"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
	"github.com/nerijusdu/vesa/pkg/util"
)

type TemplateRepository struct {
	defaultTemplates []Template
}

func NewTemplateRepository(defaultTemplatesDir embed.FS) *TemplateRepository {
	if !util.FileExists("templates.json") {
		err := util.WriteFile(&Templates{Templates: []Template{}}, "templates.json")
		if err != nil {
			panic(err)
		}
	}

	dir, err := defaultTemplatesDir.ReadDir("templates")
	if err != nil {
		panic(err)
	}

	var defaultTemplates []Template
	for _, file := range dir {
		if file.IsDir() {
			continue
		}

		bytes, err := defaultTemplatesDir.ReadFile("templates/" + file.Name())
		if err != nil {
			panic(err)
		}

		template := &dockerctrl.RunContainerRequest{}
		if err := json.Unmarshal(bytes, template); err != nil {
			panic(err)
		}

		defaultTemplates = append(defaultTemplates, Template{
			ID:        "system-template:" + strings.Split(file.Name(), ".")[0],
			IsSystem:  true,
			Container: *template,
		})
	}

	return &TemplateRepository{
		defaultTemplates: defaultTemplates,
	}
}

func (t *TemplateRepository) GetTemplates() ([]Template, error) {
	templates, err := util.ReadFile[Templates]("templates.json")
	if err != nil {
		return nil, err
	}

	allTemplates := append(templates.Templates, t.defaultTemplates...)

	return allTemplates, nil
}

var emptyTemplate = Template{}

func (t *TemplateRepository) GetTemplate(id string) (Template, error) {
	templates, err := t.GetTemplates()
	if err != nil {
		return emptyTemplate, err
	}

	for _, template := range templates {
		if template.ID == id {
			return template, nil
		}
	}

	return emptyTemplate, nil
}

func (t *TemplateRepository) SaveTemplate(template Template) (string, error) {
	templates, err := t.GetTemplates()
	if err != nil {
		return "", err
	}

	if template.ID == "" {
		template.ID = uuid.NewString()
		templates = append(templates, template)
	} else {
		for i, temp := range templates {
			if temp.ID == template.ID && !strings.Contains(temp.ID, "system-template") {
				templates[i] = template
			}
		}
	}

	err = util.WriteFile(&Templates{Templates: templates}, "templates.json")
	if err != nil {
		return "", err
	}

	return template.ID, nil
}

func (t *TemplateRepository) DeleteTemplate(id string) error {
	templates, err := t.GetTemplates()
	if err != nil {
		return err
	}

	for i, template := range templates {
		if template.ID == id {
			templates = append(templates[:i], templates[i+1:]...)
		}
	}

	err = util.WriteFile(&Templates{Templates: templates}, "templates.json")
	if err != nil {
		return err
	}

	return nil
}
