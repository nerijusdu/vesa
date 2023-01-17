# vesa
Very Easy Sys Admin - deploy projects to a VPS without having 153948 years of sys admin experience

## TODO
Docker:
- [X] View containers
- [X] Create a container for image
- [X] Assign ports
- [X] Container networking (connect to other containers)
  - [X] Preview networks
  - [X] Create a network
- [ ] Container volumes (mount host directories)
  - [ ] Manage volumes
- [ ] Container environment variables
- [ ] Container logs

Nginx:
- [ ] Edit config to add new site
- [ ] Reload nginx
- [ ] Create SSL certs

Other:
- [X] Web GUI
- [ ] Generate github actions for deployment
  - [ ] Ping api to deploy newer version instead of ssh
- [ ] Authentication

## Implementation details

- `Project` will be the main entity
- You can add docker containers to projects
- You can add nginx sites to projects
