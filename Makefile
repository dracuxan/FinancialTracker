.PHONY: all clean test build up down restart logs ps

build:
	docker-compose build

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	@if git diff --quiet HEAD~1; then \
		echo "No changes detected, skipping restart."; \
	else \
		echo "Changes detected, restarting services..."; \
		docker-compose up -d --build; \
	fi

logs:
	docker-compose logs -f

ps:
	docker ps
