#!/bin/bash

set -eo pipefail

export HOME="$${HOME:-/home/ec2-user}"
WORK_DIR="/home/ec2-user"

# Update system
sudo dnf update -y

# Install Basic Dependencies
sudo dnf install -y git curl unzip --allowerasing

# Install Node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source /.nvm/nvm.sh
nvm install 24

# Install Bun
curl -fsSL https://bun.com/install | bash -s "bun-v1.3.2"
source "$WORK_DIR/.bash_profile"

# Clone repo
git clone https://github.com/g-raman/uenroll.git "$WORK_DIR/uenroll"

# Add API key to .env
echo "DATABASE_URL=\"${DATABASE_URL}\"" >> "$WORK_DIR/uenroll/apps/scraper/.env"

# Install dependencies
cd "$WORK_DIR/uenroll"
"$WORK_DIR/.bun/bin/bun" install --filter scraper

# Install Turbo
"$WORK_DIR/.bun/bin/bun" install -g turbo
source "$WORK_DIR/.bash_profile"

# Build Scraper
"$WORK_DIR/.bun/bin/bun" run build --filter scraper

# Make director to store logs
mkdir -p /var/logs/scraper/

# Add GITHUB_TOKEN to Environment variables
echo 'export GITHUB_TOKEN="${GITHUB_TOKEN}"' >> /etc/profile
source /etc/profile

cd "$WORK_DIR/uenroll/apps/scraper"
chmod +x ./src/scrape.sh
# ./src/scrape.sh >> /var/logs/scraper/scraper.log
