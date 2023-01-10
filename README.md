# vesa
Very Easy Sys Admin - deploy projects to a VPS without having 153948 years of sys admin experience

## TODO
Docker:
- [X] View containers
- [ ] Create a container for image
- [ ] Assign ports
- [ ] Container networking (connect to other containers)
- [ ] Container volumes (mount host directories)
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
