#!/bin/bash

# Update system
sudo dnf update -y

# Install git
sudo dnf install -y git

# Install curl
sudo dnf install -y curl

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source /.nvm/nvm.sh
nvm install 24

# Install PNPM
npm install -g pnpm
source ~/.bashrc

# Clone repo
WORK_DIR="/uenroll"
git clone https://github.com/g-raman/uenroll.git "$WORK_DIR"

# Add API key to .env
echo "DATABASE_URL=\"${DATABASE_URL}\"" >> "$HOME/uenroll/apps/scraper/.env"

# Install dependencies & ensure EC2 insance CPU & I/O is not exhausted
cd "$WORK_DIR"
pnpm install --filter '!./apps/web' --network-concurrency=1

# Build Scraper
pnpm dlx turbo build --filter scraper

# Make director to store logs
mkdir -p /var/logs/scraper/

# Add GITHUB_TOKEN to Environment variables
echo 'export GITHUB_TOKEN="${GITHUB_TOKEN}"' >> /etc/profile
source /etc/profile

WORK_DIR="/uenroll/apps/scraper"
cd "$WORK_DIR"
chmod +x ./src/scrape.sh
./src/scrape.sh >> /var/logs/scraper/scraper.log
