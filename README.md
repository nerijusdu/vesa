# vesa
Very Easy Sys Admin - deploy projects to a VPS without having 153948 years of sys admin experience

## About
This is an alternative to docker-compose with a GUI. Why? Because I don't want to ssh into my server every time I want to make a small update to my side project.

## Setup
- Clone repo
- Run `make build`
- Make it executable `chmod +x ./bin/vesa`
- Run `./bin/vesa`

### Setup github actions releases

To create easy realeases using github actions copy files from `github-actions` folder to your projects `.github/workflows` folder.

Open `release.yml` file and update environment variables and required secrets to your github repository.

## TODO

Docker:
- [X] View containers
- [X] Create a container
- [X] Container networking (connect to other containers)
- [X] Container volumes
  - [ ] Manage volumes
- [X] Container environment variables
- [X] Registry auth
  - [ ] Test docker hub auth
- [X] Save container templates

Nginx:
- [ ] Edit config to add new site
- [ ] Reload nginx
- [ ] Create SSL certs
- [ ] Use Traefik instead of nginx?

Other:
- [X] Web GUI
- [X] Generate github actions for deployment
  - [X] Api endpoint to deploy newer version instead of ssh
- [ ] Secret manager
- [ ] Create a tempate without creating a container
- [ ] Config update
- [ ] Edit template json
- [ ] Installation or setting up as a service

