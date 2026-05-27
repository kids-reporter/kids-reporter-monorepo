P := "\\033[32m[+]\\033[0m"
DB_GENERATE_LOCAL ?= true
ENV_FILE ?= .env.local
DOTENV_FLAGS ?=
DOTENV := yarn dotenv -e $(ENV_FILE) $(DOTENV_FLAGS) --

help:
	@echo "$(P) make build - Transpile typescript files"
	@echo "$(P) make build-deps - build workspace deps used by content-api"
	@echo "$(P) make postinstall - run after dependencies installation"

build-deps:
	@if [ "$(SKIP_BUILD_DEPS)" = "true" ]; then \
		echo "$(P) Build deps skipped"; \
	else \
		echo "$(P) build api-types and db"; \
		cd ../api-types; yarn build; \
		cd ../db; yarn build; \
	fi

db-generate:
	@echo "$(P) generate prisma client for db"
	@if [ "$(DB_GENERATE_LOCAL)" = "true" ]; then \
		cd ../db && yarn db:generate; \
	else \
		SCHEMA_PATH=$$(node -p "const path=require('path'); const entry=require.resolve('@kids-reporter/db'); path.join(path.dirname(entry),'schema.prisma')"); \
		if [ ! -f "$$SCHEMA_PATH" ]; then \
			echo "$(P) missing prisma schema at $$SCHEMA_PATH (expected from installed @kids-reporter/db)"; \
			exit 1; \
		fi; \
		yarn prisma generate --schema "$$SCHEMA_PATH"; \
	fi

postinstall: build-deps db-generate
	@echo "$(P) postinstall"

build-dist:
	@echo "$(P) Transpile typescript files"
	@if [ ! -d dist ]; then \
		echo "$(P) dist/ missing, clearing incremental cache"; \
		rm -f tsconfig.tsbuildinfo; \
	fi
	yarn tsc

dev-server:
	@echo "$(P) Start dev server"
	@$(MAKE) build-dist && \
	if [ -f "$(ENV_FILE)" ]; then \
		NODE_ENV=development $(DOTENV) node dist/server; \
	else \
		echo "$(P) $(ENV_FILE) not found, starting without dotenv"; \
		NODE_ENV=development node dist/server; \
	fi

dev:
	yarn nodemon -w ./src -e ts --exec make dev-server

start: build-dist
	@echo "$(P) Start production server"
	@if [ -f "$(ENV_FILE)" ]; then \
		NODE_ENV=production $(DOTENV) node dist/server; \
	else \
		echo "$(P) $(ENV_FILE) not found, starting without dotenv"; \
		NODE_ENV=production node dist/server; \
	fi

build: clean build-dist

lint:
	@echo "$(P) Start linting"
	yarn eslint src --fix

clean:
	@echo "$(P) Clean dist/"
	rm -rf dist/
	rm -f tsconfig.tsbuildinfo

.PHONY: build clean build-dist help dev-server dev start lint build-deps postinstall db-generate

