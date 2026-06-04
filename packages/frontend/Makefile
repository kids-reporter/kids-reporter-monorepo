P := "\\033[32m[+]\\033[0m"

help:
	@echo "$(P) make postinstall - run after dependencies installation"
	@echo "$(P) make build-deps - build workspace deps (logger, routing-ui)"

postinstall:
	@$(MAKE) build-deps

build-deps:
	@if [ "$(SKIP_BUILD_DEPS)" = "true" ]; then \
		echo "$(P) Build deps skipped"; \
	else \
		echo "$(P) build logger, routing-ui, and api-types"; \
		cd ../logger && yarn build; \
		cd ../routing-ui && yarn build; \
	fi

.PHONY: help postinstall build-deps
