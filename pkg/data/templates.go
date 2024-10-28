package data

import (
	"embed"
	"encoding/json"
	"io"
	"strings"
	"text/template"

	"github.com/google/uuid"
	"github.com/nerijusdu/vesa/pkg/config"
	"github.com/nerijusdu/vesa/pkg/dockerctrl"
	"github.com/nerijusdu/vesa/pkg/util"
)

type TemplateRepository struct {
	defaultTemplates []Template
}

type SystemTemplateVars struct {
	UserEmail string
	ConfigDir string
}

func NewTemplateRepository(defaultTemplatesDir embed.FS, c *config.Config) *TemplateRepository {
	if !util.FileExists("templates.json") {
		err := util.WriteFile(&Templates{Templates: []Template{}}, "templates.json")
		if err != nil {
			panic(err)
		}
	}

	dataDir, err := util.GetDataDir()
	if err != nil {
		panic(err)
	}

	templateVars := SystemTemplateVars{
		UserEmail: c.UserEmail,
		ConfigDir: dataDir,
	}
	tmpl, err := template.ParseFS(defaultTemplatesDir, "templates/*")
	if err != nil {
		panic(err)
	}

	var defaultTemplates []Template
	for _, t := range tmpl.Templates() {
		reader, writer := io.Pipe()
		go func() {
			err := t.Execute(writer, templateVars)
			writer.CloseWithError(err)
		}()

		template := &dockerctrl.RunContainerRequest{}
		if err := json.NewDecoder(reader).Decode(template); err != nil {
			panic(err)
		}

		defaultTemplates = append(defaultTemplates, Template{
			ID:        "system-template:" + strings.Split(t.Name(), ".")[0],
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
			if temp.ID == template.ID {
				templates[i] = template
			}
		}
	}

	templatesToSave := []Template{}
	for _, temp := range templates {
		if !strings.Contains(temp.ID, "system-template") {
			templatesToSave = append(templatesToSave, temp)
		}
	}

	err = util.WriteFile(&Templates{Templates: templatesToSave}, "templates.json")
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

	templatesToSave := []Template{}
	for _, temp := range templates {
		if !strings.Contains(temp.ID, "system-template") {
			templatesToSave = append(templatesToSave, temp)
		}
	}

	err = util.WriteFile(&Templates{Templates: templatesToSave}, "templates.json")
	if err != nil {
		return err
	}

	return nil
}
