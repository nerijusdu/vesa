package data

import (
	"github.com/google/uuid"
	"github.com/nerijusdu/vesa/pkg/util"
)

type JobsRepository struct {
}

func NewJobsRepository() *JobsRepository {
	if !util.FileExists("jobs.json") {
		err := util.WriteFile(&Jobs{Jobs: []Job{}}, "jobs.json")
		if err != nil {
			panic(err)
		}
	}

	return &JobsRepository{}
}

func (r *JobsRepository) GetJobs() ([]Job, error) {
	jobs, err := util.ReadFile[Jobs]("jobs.json")
	if err != nil {
		return nil, err
	}
	return jobs.Jobs, nil
}

var emptyJob = Job{}

func (r *JobsRepository) GetJob(id string) (Job, error) {
	jobs, err := r.GetJobs()
	if err != nil {
		return emptyJob, err
	}

	for _, job := range jobs {
		if job.ID == id {
			return job, nil
		}
	}

	return emptyJob, nil
}

func (r *JobsRepository) SaveJob(job Job) (string, error) {
	jobs, err := r.GetJobs()
	if err != nil {
		return "", err
	}

	if job.ID == "" {
		job.ID = uuid.NewString()
		jobs = append(jobs, job)
	} else {
		for i, j := range jobs {
			if j.ID == job.ID {
				jobs[i] = job
			}
		}
	}

	err = util.WriteFile(&Jobs{Jobs: jobs}, "jobs.json")
	if err != nil {
		return "", err
	}

	return job.ID, nil
}

func (r *JobsRepository) DeleteJob(id string) error {
	jobs, err := r.GetJobs()
	if err != nil {
		return err
	}

	for i, job := range jobs {
		if job.ID == id {
			jobs = append(jobs[:i], jobs[i+1:]...)
			break
		}
	}

	err = util.WriteFile(&Jobs{Jobs: jobs}, "jobs.json")
	if err != nil {
		return err
	}

	return nil
}
