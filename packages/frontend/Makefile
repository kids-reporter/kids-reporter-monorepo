P := "\\033[32m[+]\\033[0m"

help:
	@echo "$(P) make postinstall - run after dependencies installation"
	@echo "$(P) make build-deps - build workspace deps (logger, routing-ui)"

postinstall:
	@$(MAKE) build-deps codegen-local

build-deps:
	@if [ "$(SKIP_BUILD_DEPS)" = "true" ]; then \
		echo "$(P) Build deps skipped"; \
	else \
		echo "$(P) build logger and routing-ui"; \
		cd ../logger && yarn build; \
		cd ../routing-ui && yarn build; \
	fi

codegen-local:
	@if [ "$(SKIP_CODEGEN_LOCAL)" = "true" ]; then \
		echo "$(P) Codegen skipped"; \
	else \
		echo "$(P) graphql codegen (local)"; \
		yarn codegen:local; \
	fi

.PHONY: help postinstall build-deps codegen-local
