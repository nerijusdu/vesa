build-web:
	echo "Building web..."
	cd web && npm i && npm run build
	mkdir -p public
	cp -r web/dist/* public

build-server:
	echo "Building server..."
	go build -o ./bin/vesa

build: build-web build-server

build-linux:
	echo "Building for linux..."
	GOOS=linux GOARCH=amd64 make build

run-web:
	echo "Starting dev..."
	cd web && npm run dev

run-server:
	echo "Starting server..."
	go run .

host-bin:
	python3 -m servefile ./bin/vesa & ngrok http 8080
