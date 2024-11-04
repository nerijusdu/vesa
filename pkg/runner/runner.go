package runner

import (
	"fmt"
	"net/http"

	"github.com/go-co-op/gocron/v2"
	"github.com/nerijusdu/vesa/pkg/data"
)

type JobRunner struct {
	scheduler *gocron.Scheduler
}

func NewJobRunner(initialJobs []data.Job) *JobRunner {
	s, err := gocron.NewScheduler()
	if err != nil {
		panic(err)
	}

	for _, job := range initialJobs {
		if !job.Enabled {
			continue
		}

		_, err := s.NewJob(
			gocron.CronJob(job.Schedule, true),
			gocron.NewTask(runCronJob, job),
			gocron.WithTags(job.ID),
		)

		if err != nil {
			panic(err)
		}
	}

	s.Start()

	return &JobRunner{scheduler: &s}
}

func (runner *JobRunner) AddJob(job data.Job) error {
	_, err := (*runner.scheduler).NewJob(
		gocron.CronJob(job.Schedule, true),
		gocron.NewTask(runCronJob, job),
		gocron.WithTags(job.ID),
	)
	if err != nil {
		return err
	}
	return nil
}

func (runner *JobRunner) RemoveJob(id string) error {
	fmt.Println("Removing job", id)
	j := (*runner.scheduler).Jobs()
	for _, job := range j {
		fmt.Println("Job", job.Name(), job.ID(), job.Tags())
	}

	(*runner.scheduler).RemoveByTags(id)
	return nil
}

func runCronJob(job data.Job) {
	fmt.Println("Running job", job.Name)

	httpReq, err := http.NewRequest("GET", job.Url, nil)
	if err != nil {
		fmt.Println("Job failed with error", err)
		return
	}

	if job.Secret != "" {
		httpReq.Header.Add("Authorization", "Bearer "+job.Secret)
	}

	resp, err := http.DefaultClient.Do(httpReq)
	if err != nil {
		fmt.Println("Job failed with error", err)
		return
	}

	if resp.StatusCode != 200 {
		fmt.Println("Job failed with status code " + string(resp.StatusCode))
		return
	}

	fmt.Println("Job finished successfully")
}
