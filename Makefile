build-web:
	echo "Building web..."
	cd web && npm run build
	mkdir -p server/public
	cp -r web/dist/* server/public

run-web:
	echo "Starting dev..."
	cd web && npm run dev

run-server:
	echo "Starting server..."
	cd server && go run .