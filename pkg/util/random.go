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

func BuildTraefikRule(host string, pathPrefixes []string) string {
	rules := []string{}
	if host != "" {
		rules = append(rules, "Host(`"+host+"`)")
	}
	prefixRules := []string{}
	for _, prefix := range pathPrefixes {
		if prefix != "" {
			prefixRules = append(prefixRules, "PathPrefix(`"+prefix+"`)")
		}
	}

	if len(prefixRules) > 0 {
		rules = append(rules, "("+strings.Join(prefixRules, " || ")+")")
	}

	return strings.Join(rules, " && ")
}
