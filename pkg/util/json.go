package util

import (
	"encoding/json"
	"errors"
	"os"
)

func GetDataDir() (string, error) {
	dirname, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	return dirname + "/.config/vesa", nil
}

func ReadFile[T any](file string) (*T, error) {
	dir, err := GetDataDir()
	if err != nil {
		return nil, err
	}

	f, err := os.Open(dir + "/" + file)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	var data T
	if err := json.NewDecoder(f).Decode(&data); err != nil {
		return nil, err
	}

	return &data, nil
}

func WriteFile[T any](data *T, file string) error {
	dir, err := GetDataDir()
	if err != nil {
		return err
	}

	os.MkdirAll(dir, 0755)
	f, err := os.Create(dir + "/" + file)
	if err != nil {
		return err
	}
	defer f.Close()

	if err := json.NewEncoder(f).Encode(data); err != nil {
		return err
	}
	return nil
}

func FileExists(path string) bool {
	dir, err := GetDataDir()
	if err != nil {
		panic(err)
	}

	_, err = os.Stat(dir + "/" + path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return false
		}
		panic(err)
	}

	return true
}
