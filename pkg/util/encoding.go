package util

import (
	"os"
)

type FileEncoder interface {
	Encode(v any) error
}

type FileDecoder interface {
	Decode(v any) error
}

type TxtCoder struct {
	f *os.File
}

// I probably dont need this
func NewTxtEncoder(f *os.File) TxtCoder {
	return TxtCoder{f}
}

func (e TxtCoder) Encode(v any) error {
	_, err := e.f.WriteString(*v.(*string))
	return err
}

func (e TxtCoder) Decode(v any) error {
	return nil
}
