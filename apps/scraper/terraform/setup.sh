#!/bin/bash

set -eo pipefail

export HOME="$${HOME:-/home/ec2-user}"

# Update system
sudo dnf update -y

# Install Basic Dependencies
sudo dnf install -y git curl unzip --allowerasing

# Install Bun
curl -fsSL https://bun.com/install | bash -s "bun-v1.3.2"
source "$HOME/.bash_profile"

# Clone repo
WORK_DIR="/uenroll"
git clone https://github.com/g-raman/uenroll.git "$WORK_DIR"

# Add API key to .env
echo "DATABASE_URL=\"${DATABASE_URL}\"" >> "/uenroll/apps/scraper/.env"

# Install dependencies
cd "$WORK_DIR"
"$HOME/.bun/bin/bun" install --filter scraper

# Install Turbo
"$HOME/.bun/bin/bun" install -g turbo

# Build Scraper
"$HOME/.bun/bin/bun" run build --filter scraper

# Make director to store logs
mkdir -p /var/logs/scraper/

# Add GITHUB_TOKEN to Environment variables
echo 'export GITHUB_TOKEN="${GITHUB_TOKEN}"' >> /etc/profile
source /etc/profile

WORK_DIR="/uenroll/apps/scraper"
cd "$WORK_DIR"
chmod +x ./src/scrape.sh
# ./src/scrape.sh >> /var/logs/scraper/scraper.log
