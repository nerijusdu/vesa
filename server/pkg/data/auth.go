package data

import "github.com/nerijusdu/vesa/pkg/util"

type AuthRepository struct{}

func NewAuthRepository() *AuthRepository {
	if !util.FileExists("auth.json") {
		err := util.WriteFile(&Registries{Registries: []RegistryAuth{}}, "auth.json")
		if err != nil {
			panic(err)
		}
	}

	return &AuthRepository{}
}

func (r *AuthRepository) GetAuths() ([]RegistryAuth, error) {
	auths, err := util.ReadFile[Registries]("auth.json")
	if err != nil {
		return nil, err
	}

	return auths.Registries, nil
}

func (r *AuthRepository) SaveAuth(auth RegistryAuth) error {
	auths, err := r.GetAuths()
	if err != nil {
		return err
	}

	found := false
	for i, a := range auths {
		if a.ServerAddress == a.ServerAddress {
			auths[i] = auth
			found = true
			break
		}
	}

	if !found {
		auths = append(auths, auth)
	}

	err = util.WriteFile(&Registries{Registries: auths}, "auth.json")
	return err
}

func (r *AuthRepository) GetToken(serverUrl string) (string, error) {
	auths, err := r.GetAuths()
	if err != nil {
		return "", err
	}

  for _, a := range auths {
    if a.ServerAddress == serverUrl {
      return a.IdentityToken, nil
    }
  }

	return "", nil
}
