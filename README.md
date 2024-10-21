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

- [Install go](https://go.dev/doc/install)
- Run `go install github.com/nerijusdu/vesa@latest`
- Run `vesa --init` to initialize the app for the first time (running this command multiple times will rewrite the current config)
- Run `vesa` to start the server

### Auto start on boot
To auto start vesa when your server boots up create a systemd service file in `/etc/systemd/system/vesa.service` with the following content:
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
To create easy releases using github actions
- Create an API client through web interface (Settings -> Client authentication)
- Copy files from `github-actions` folder to your projects `.github/workflows` folder
- Open `release.yml` file and update environment variables and required secrets to your github repository.

## Troubleshooting

If traefik can't times out while connecting to host services:
- Allow docker to access local service with `sudo ufw allow from 172.22.0.0/16 to 172.17.0.1`

## TODO

Docker:
- [X] View containers
- [X] Create a container
- [X] Container networking (connect to other containers)
  - [X] Multiple networks select
- [X] Container volumes
  - [ ] Manage volumes
- [X] Container environment variables
- [X] Registry auth
  - [ ] Test docker hub auth
- [X] Save container templates

Traefik:
- [X] Add traefik labels
- [X] Run traefik container
- [X] Manage SSL certificates
- [ ] Manage configuration file
  - [ ] Request user email for certs
- [X] Custom rules for non-container apps
  - [X] Add apps
  - [X] Build traefik config from apps
  Test:
  - [X] vesa.domain.com
  - [X] domain.com/tts
  - [X] domain.com

Other:
- [X] Web GUI
- [X] Generate github actions for deployment
  - [X] Api endpoint to deploy newer version instead of ssh
- [ ] Secret manager
- [X] Create a tempate without creating a container
- [X] Hash passwords and api keys
- [X] Config update
- [X] Edit template json
- [X] Document installation or setting up as a service
- [ ] Is it possible to use vesa in container?
