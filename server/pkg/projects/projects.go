package projects

import (
	"github.com/nerijusdu/vesa/pkg/util"
)

type ProjectsRepository struct {
}

func NewProjectsRepository() *ProjectsRepository {
	if !util.FileExists("projects.json") {
		err := util.WriteFile(&Projects{Projects: []Project{}}, "projects.json")
		if err != nil {
			panic(err)
		}
	}

	return &ProjectsRepository{}
}

func (p *ProjectsRepository) GetProjects() ([]Project, error) {
	proj, err := util.ReadFile[Projects]("projects.json")
	if err != nil {
		return nil, err
	}

	return proj.Projects, nil
}

var emptyProj = Project{}

func (p *ProjectsRepository) GetProject(id string) (Project, error) {
	projects, err := p.GetProjects()
	if err != nil {
		return emptyProj, err
	}

	for _, project := range projects {
		if project.ID == id {
			return project, nil
		}
	}

	return emptyProj, nil
}

func (p *ProjectsRepository) SaveProject(project Project) error {
	projects, err := p.GetProjects()
	if err != nil {
		return err
	}

	found := false
	for i, proj := range projects {
		if proj.ID == project.ID {
			projects[i] = project
			found = true
			break
		}
	}

	if !found {
		projects = append(projects, project)
	}

	return util.WriteFile(&Projects{Projects: projects}, "projects.json")
}

func (p *ProjectsRepository) DeleteProject(id string) error {
	projects, err := p.GetProjects()
	if err != nil {
		return err
	}

	for i, project := range projects {
		if project.ID == id {
			projects = append(projects[:i], projects[i+1:]...)
			break
		}
	}

	return util.WriteFile(&Projects{Projects: projects}, "projects.json")
}
