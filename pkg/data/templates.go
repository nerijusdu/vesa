package data

import (
	"github.com/google/uuid"
	"github.com/nerijusdu/vesa/pkg/util"
)

type TemplateRepository struct {
}

func NewTemplateRepository() *TemplateRepository {
	if !util.FileExists("templates.json") {
		err := util.WriteFile(&Templates{Templates: []Template{}}, "templates.json")
		if err != nil {
			panic(err)
		}
	}

	return &TemplateRepository{}
}

func (t *TemplateRepository) GetTemplates() ([]Template, error) {
	templates, err := util.ReadFile[Templates]("templates.json")
	if err != nil {
		return nil, err
	}

	return templates.Templates, nil
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
			if temp.ID == template.ID {
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
