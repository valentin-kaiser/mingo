prod: install-dependencies bundle-frontend remove-placeholder copy-frontend build-executable clean-project recreate-placeholder
run: install-dependencies clean-project bundle-frontend copy-frontend run-development
clean: clean-project recreate-placeholder

# Install dependencies for backend and frontend
install-dependencies:
	cd ./application/backend && go mod tidy
	cd ./application/frontend && npm install

bundle-frontend:
	cd ./application/frontend && npm run build

remove-placeholder:
	rm -f ./application/backend/static/PLACEHOLDER

# Copy frontend files to static folder
copy-frontend:
	cp -r ./application/frontend/public/* ./application/backend/static/

# Build Golang executable from backend
build-executable:
	$(MAKE) prod -C application/backend/

# Remove frontend from backend after build
clean-project:
	rm -rf ./application/backend/static/*
	rm -rf ./application/frontend/dist/*

recreate-placeholder:
	touch ./application/backend/static/PLACEHOLDER

run-development:
	$(MAKE) run -C application/backend/