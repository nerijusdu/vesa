package util

import (
	"regexp"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
	"golang.org/x/exp/rand"
)

func GenerateRandomString(length int) string {
	charset := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	seededRand := rand.New(rand.NewSource(uint64(time.Now().UnixNano())))
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

func HashPassword(password string) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hashedPassword), nil
}

func ComparePassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

var regex = regexp.MustCompile("[^a-z0-9_-]")

func NormalizeName(name string) string {
	newName := strings.ToLower(name)
	newName = regex.ReplaceAllString(newName, "_")

	return newName
}
