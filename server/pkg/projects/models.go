package projects

type Project struct {
	ID         string   `json:"id"`
	Name       string   `json:"name" validate:"required"`
	Containers []string `json:"containers"`
}

type Projects struct {
	Projects []Project `json:"projects"`
}
