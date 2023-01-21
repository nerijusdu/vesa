package projects

import (
	"github.com/doug-martin/goqu/v9"
)

type ProjectsRepository struct {
	db *goqu.Database
}

func NewProjectsRepository(db *goqu.Database) *ProjectsRepository {
	return &ProjectsRepository{db}
}
