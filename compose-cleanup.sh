docker compose down

docker images --format "{{.Repository}}:{{.Tag}}" | \
  grep -E "^4agql-" | \
  xargs -r docker rmi -f