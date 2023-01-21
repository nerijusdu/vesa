build-web:
	echo "Building web..."
	cd web && npm run build
	mkdir -p server/public
	cp -r web/dist/* server/public

build-server:
	echo "Building server..."
	cd server && go build -o ../bin/vesa

build: build-web build-server

build-linux:
	echo "Building for linux..."
	GOOS=linux GOARCH=amd64 make build

run-web:
	echo "Starting dev..."
	cd web && npm run dev

run-server:
	echo "Starting server..."
	cd server && go run .
