# vesa
Very Easy Sys Admin - deploy projects to a VPS without having 153948 years of sys admin experience

## TODO

Quick TODOs:
- [X] Actions in container details screen
- [X] Create a template from a running container
- [X] Edit templates
- [ ] Button to hide/show env values
- [X] Add labels to template containers
  - [X] Show containers with this label in projects and templates

Docker:
- [X] View containers
  - [X] Inspect containers
- [X] Create a container for image
- [X] Assign ports
- [X] Container networking (connect to other containers)
  - [X] Preview networks
  - [X] Create a network
- [X] Container volumes (mount host directories)
  - [X] Mount volumes (not just directories)
  - [ ] Manage volumes
- [X] Container environment variables
- [X] Container logs
- [ ] Registry auth
- [X] Save container templates
- [X] Restart flag

Nginx:
- [ ] Edit config to add new site
- [ ] Reload nginx
- [ ] Create SSL certs
- [ ] Use Traefik instead of nginx?

Other:
- [X] Web GUI
- [ ] Generate github actions for deployment
  - [ ] Ping api to deploy newer version instead of ssh
- [X] Authentication
- [ ] Secret manager
- [X] Project management
  - [X] Edit project
  - [ ] Delete project with all resources
  - [X] Start, stop, restart containers
  - [X] Pull latest containers
  - [ ] Cascade projects when deleting resources
  - [ ] Compose projects of templates

## Implementation details

- `Project` will be the main entity
- You can add docker containers to projects
- You can add nginx sites to projects
