docker compose down

docker images --format "{{.Repository}}:{{.Tag}}" | \
  grep -E "^4AGQL-" | \
  xargs -r docker rmi -f