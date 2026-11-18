P := "\\033[32m[+]\\033[0m"

help:
	@echo "$(P) make build-deps - build core, draft-editor and draft-renderer"
	@echo "$(p) make postinstall - run after dependencies installation"

apply-patches:
	@if [ "$(SKIP_PATCH_PACKAGE)" = "true" ]; then \
		echo "Patch package skipped."; \
	elif [ -d node_modules/@keystone-6/auth ]; then \
		echo "$(P) patch package"; \
		yarn exec patch-package --error-on-fail; \
	else \
		echo "$(P) patch package"; \
		cd ../.. && ./node_modules/.bin/patch-package --patch-dir packages/cms/patches --error-on-fail; \
	fi

postinstall: build-deps
	@$(MAKE) apply-patches
	@yarn keystone build --no-ui;
	@$(MAKE) apply-patches

build-deps:
	@if [ "$(SKIP_BUILD_DEPS)" = "true" ]; then \
		echo "Build skipped."; \
	else \
		echo "$(P) build core, draft-editor and draft-renderer"; \
		cd ../core; make build; \
		cd ../draft-editor; make build; \
		cd ../draft-renderer; make build; \
	fi

.PHONY: build-deps apply-patches
