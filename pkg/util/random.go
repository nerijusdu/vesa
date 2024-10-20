package util

import (
	"regexp"
	"strings"
)

var regex = regexp.MustCompile("[^a-z0-9_-]")

func NormalizeName(name string) string {
	newName := strings.ToLower(name)
	newName = regex.ReplaceAllString(newName, "_")

	return newName
}

func BuildTraefikRule(host, pathPrefix string) string {
	rules := []string{}
	if host != "" {
		rules = append(rules, "Host(`"+host+"`)")
	}
	if pathPrefix != "" {
		rules = append(rules, "PathPrefix(`"+pathPrefix+"`)")
	}

	return strings.Join(rules, " && ")
}
