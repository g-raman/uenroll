#!/bin/bash

# Still need to use Puppeteer for Subjects
docker container run -d -p 9222:9222 zenika/alpine-chrome --no-sandbox --remote-debugging-address=0.0.0.0 --remote-debugging-port=9222 https://www.chromestatus.com/
pnpm scrape:subjects 
docker stop $(docker ps -q)
docker container prune -f

start_time=$(date +%s)
pnpm scrape:terms 
pnpm scrape:courses 

end_time=$(date +%s)
execution_time=$((end_time - start_time))
echo "Total Scraping Time: $execution_time seconds"

pnpm db:cleanup

# Take down AWS resources
curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/g-raman/uenroll/actions/workflows/terraform-destroy.yml/dispatches \
  -d '{"ref":"main"}'
