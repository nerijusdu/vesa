package data

import (
	"fmt"
	"strings"
	"time"

	"github.com/nerijusdu/vesa/pkg/util"
)

type LogsRepository struct{}

type Log struct {
	Message string `json:"message"`
	Tag     string `json:"tag"`
}

func NewLogsRepository() *LogsRepository {
	if !util.FileExists("logs.txt") {
		content := ""
		err := util.WriteFile(&content, "logs.txt")
		if err != nil {
			panic(err)
		}
	}

	return &LogsRepository{}
}

func (r *LogsRepository) GetLogs(tag string) ([]string, error) {
	result := []string{}
	content, err := util.ReadTxtFile("logs.txt")
	if err != nil {
		return result, err
	}

	for _, s := range strings.Split(*content, "\n") {
		if s == "" {
			continue
		}
		vals := strings.Split(s, "|")
		if vals[0] == tag {
			rest := strings.Join(vals[1:], "|")
			result = append(result, rest)
		}
	}

	return result, nil
}

func (r *LogsRepository) Write(tag, message string) error {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	log := tag + "|" + timestamp + " " + message + "\n"
	fmt.Println("log", log)
	err := util.AppendToFile("logs.txt", log)
	return err
}

func (r *LogsRepository) DeleteLogs(tag string) error {
	content, err := util.ReadTxtFile("logs.txt")
	if err != nil {
		return err
	}

	lines := strings.Split(*content, "\n")
	newContent := ""
	for _, line := range lines {
		if strings.HasPrefix(line, tag) {
			continue
		}

		newContent += line + "\n"
	}

	return util.WriteFile(&newContent, "logs.txt")
}
