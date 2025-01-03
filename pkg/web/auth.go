package web

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/oauth"
	"github.com/nerijusdu/vesa/pkg/config"
	"github.com/nerijusdu/vesa/pkg/util"
)

func setupAuth(router chi.Router, c *config.Config) {
	s := oauth.NewBearerServer(
		c.JWTSecret,
		time.Hour*24,
		&UserVerifier{config: c},
		nil,
	)

	router.Post("/api/token", s.UserCredentials)
	router.Post("/api/auth", s.ClientCredentials)
}

type UserVerifier struct {
	config *config.Config
}

func AuthorizeApiSecret(router chi.Router, c *config.Config) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			auth, err := parseAuthorizationHeader(r.Header.Get("Authorization"))
			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte(err.Error()))
				return
			}

			c, ok := util.Find(c.Clients, func(c config.Client) bool {
				return util.ComparePassword(c.Secret, auth)
			})

			if !ok {
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte("Unauthorized"))
				return
			}

			fmt.Println("Authorizing API for client: " + c.ID)

			next.ServeHTTP(w, r)
		})
	}
}

func parseAuthorizationHeader(auth string) (string, error) {
	if len(auth) < 7 {
		return "", errors.New("Invalid bearer authorization header")
	}

	authType := strings.ToLower(auth[:6])
	if authType != "bearer" {
		return "", errors.New("Invalid bearer authorization header")
	}

	auth = strings.Replace(strings.ToLower(auth), "bearer ", "", 1)
	return auth, nil
}

func (uv *UserVerifier) ValidateUser(username, password, scope string, r *http.Request) error {
	if username == uv.config.UserName && util.ComparePassword(uv.config.Password, password) {
		return nil
	}

	return errors.New("wrong user")
}

func (uv *UserVerifier) ValidateClient(clientID, clientSecret, scope string, r *http.Request) error {
	_, ok := util.Find(uv.config.Clients, func(c config.Client) bool {
		return c.ID == clientID && util.ComparePassword(c.Secret, clientSecret)
	})

	if ok {
		return nil
	}

	return errors.New("wrong client")
}

func (*UserVerifier) ValidateCode(clientID, clientSecret, code, redirectURI string, r *http.Request) (string, error) {
	return "", nil
}

func (*UserVerifier) AddClaims(tokenType oauth.TokenType, credential, tokenID, scope string, r *http.Request) (map[string]string, error) {
	claims := make(map[string]string)
	return claims, nil
}

func (*UserVerifier) AddProperties(tokenType oauth.TokenType, credential, tokenID, scope string, r *http.Request) (map[string]string, error) {
	props := make(map[string]string)
	return props, nil
}

func (*UserVerifier) ValidateTokenID(tokenType oauth.TokenType, credential, tokenID, refreshTokenID string) error {
	return errors.New("refresh token not allowed")
}

func (*UserVerifier) StoreTokenID(tokenType oauth.TokenType, credential, tokenID, refreshTokenID string) error {
	return nil
}
