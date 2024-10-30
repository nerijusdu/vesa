package util

import (
	"encoding/json"
	"errors"
	"os"
	"strings"

	"gopkg.in/yaml.v2"
)

func GetDataDir() (string, error) {
	dirname, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	return dirname + "/.config/vesa", nil
}

type FileEncoder interface {
	Encode(v any) error
}

type FileDecoder interface {
	Decode(v any) error
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

	var decoder FileDecoder
	if strings.HasSuffix(file, ".yaml") {
		decoder = yaml.NewDecoder(f)
	} else {
		decoder = json.NewDecoder(f)
	}

	var data T
	if err := decoder.Decode(&data); err != nil {
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

	var encoder FileEncoder
	if strings.HasSuffix(file, ".yaml") {
		encoder = yaml.NewEncoder(f)
	} else {
		encoder = json.NewEncoder(f)
	}

	if err := encoder.Encode(data); err != nil {
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

func CreateEmptyFile(path string) {
	dir, err := GetDataDir()
	if err != nil {
		panic(err)
	}

	f, err := os.OpenFile(dir+"/"+path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		panic(err)
	}

	f.Close()
}
