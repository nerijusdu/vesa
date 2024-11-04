package runner

import (
	"fmt"
	"net/http"

	"github.com/go-co-op/gocron/v2"
	"github.com/nerijusdu/vesa/pkg/data"
)

type JobRunner struct {
	scheduler *gocron.Scheduler
	logs      *data.LogsRepository
}

func NewJobRunner(logs *data.LogsRepository, initialJobs []data.Job) *JobRunner {
	s, err := gocron.NewScheduler()
	if err != nil {
		panic(err)
	}
	runner := &JobRunner{
		scheduler: &s,
		logs:      logs,
	}

	for _, job := range initialJobs {
		if !job.Enabled {
			continue
		}

		_, err := s.NewJob(
			gocron.CronJob(job.Schedule, true),
			gocron.NewTask(runner.runCronJob, job),
			gocron.WithTags(job.ID),
		)

		if err != nil {
			panic(err)
		}
	}

	s.Start()

	return runner
}

func (runner *JobRunner) AddJob(job data.Job) error {
	_, err := (*runner.scheduler).NewJob(
		gocron.CronJob(job.Schedule, true),
		gocron.NewTask(runner.runCronJob, job),
		gocron.WithTags(job.ID),
	)
	if err != nil {
		return err
	}
	return nil
}

func (runner *JobRunner) RemoveJob(id string) error {
	(*runner.scheduler).RemoveByTags(id)
	return nil
}

func (runner *JobRunner) runCronJob(job data.Job) {
	err := runner.logs.Write(job.ID, "Running job "+job.Name)

	httpReq, err := http.NewRequest("GET", job.Url, nil)
	if err != nil {
		runner.logs.Write(job.ID, "Job failed with error "+err.Error())
		return
	}

	if job.Secret != "" {
		httpReq.Header.Add("Authorization", "Bearer "+job.Secret)
	}

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		runner.logs.Write(job.ID, "Job failed with error"+err.Error())
		return
	}

	if resp.StatusCode != 200 {
		runner.logs.Write(
			job.ID,
			fmt.Sprintf("Job failed with status code %d", resp.StatusCode),
		)
		return
	}

	runner.logs.Write(job.ID, "Job finished successfully")
}
