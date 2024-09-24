# vesa
Very Easy Sys Admin - deploy projects to a VPS without having 153948 years of sys admin experience

## About
This is an alternative to docker-compose with a GUI. Why? Because I don't want to ssh into my server every time I want to make a small update to my side project.

## Features
- Create and manage docker containers, networks, and volumes with a web interface
- Create custom templates to launch containers with predefined settings
  - Create templates form your existing containers
- Github action to deploy automatically
- Ability to use custom docker registry (or host it yourself)

## Setup

- (Install go)[https://go.dev/doc/install]
- Run `go install github.com/nerijusdu/vesa@0.2.0`
- Run `vesa` to start the server

### Configure
When you first start the server it will generate a default config file in `~/.config/vesa/config.json`.
- `Port` - port on which the server will run
- `JWTSecret` - secret used to sign JWT tokens (just generate a random key)
- `UserName` - username for the web interface
- `Password` - password for the web interface
- `Clients` - list of allowed clients to connect to the API

### Auto start on boot
Create a systemd service file in `/etc/systemd/system/vesa.service` with the following content:
```ini
[Unit]
Description=Vesa App Service

[Service]
Environment=HOME=/home/YOUR_USERNAME
ExecStart=/home/YOUR_USERNAME/go/bin/vesa

[Install]
WantedBy=default.target
```

Replace `YOUR_USERNAME` with your username. `ExecStart` points to go binary location.

Then run the following commands:
```bash
sudo systemctl daemon-reload
sudo systemctl enable vesa
sudo systemctl start vesa
```

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
- [X] Create a tempate without creating a container
- [ ] Config update
- [ ] Edit template json
- [X] Document installation or setting up as a service
