# vesa
Very Easy Sys Admin - deploy projects to a VPS without having 153948 years of sys admin experience

## TODO
Docker:
- [X] View containers
  - [X] Inspect containers
- [X] Create a container for image
- [X] Assign ports
- [X] Container networking (connect to other containers)
  - [X] Preview networks
  - [X] Create a network
- [X] Container volumes (mount host directories)
  - [ ] Mount volumes (not just directories)
  - [ ] Manage volumes
- [X] Container environment variables
- [ ] Container logs

Nginx:
- [ ] Edit config to add new site
- [ ] Reload nginx
- [ ] Create SSL certs

Other:
- [X] Web GUI
- [ ] Generate github actions for deployment
  - [ ] Ping api to deploy newer version instead of ssh
- [X] Authentication
- [ ] Secret manager
- [X] Project management
  - [X] Edit project
  - [ ] Delete project with all resources
  - [ ] Start, stop, restart containers
  - [ ] Pull latest containers
  - [ ] Cascade projects when deleting resources

## Implementation details

- `Project` will be the main entity
- You can add docker containers to projects
- You can add nginx sites to projects
