# vesa
Very Easy Sys Admin - deploy projects to a VPS without having 153948 years of sys admin experience

## About
This is an alternative to docker-compose with a GUI. Why? Because I don't want to ssh into my server every time I want to make a small update to my side project.

## Setup
- Clone repo
- Run `make build`
- Make it executable `chmod +x ./bin/vesa`
- Run `./bin/vesa`

## TODO

Docker:
- [X] View containers
- [X] Create a container
- [X] Container networking (connect to other containers)
- [X] Container volumes
  - [ ] Manage volumes
- [X] Container environment variables
- [ ] Registry auth
  - [ ] Test docker hub auth
- [X] Save container templates

Nginx:
- [ ] Edit config to add new site
- [ ] Reload nginx
- [ ] Create SSL certs
- [ ] Use Traefik instead of nginx?

Other:
- [X] Web GUI
- [ ] Generate github actions for deployment
  - [ ] Api endpoint to deploy newer version instead of ssh
- [ ] Secret manager

