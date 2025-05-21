#!/bin/bash

# Update system
sudo dnf update -y

# Set up docker
sudo dnf install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

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
WORK_DIR="/scraper"
git clone https://github.com/g-raman/scraper.git "$WORK_DIR"

# Add API key to .env
echo "DATABASE_URL=\"${DATABASE_URL}\"" >> "$HOME/scraper/.env"

# Install dependencies
cd "$WORK_DIR"
pnpm install

# Make director to store logs
mkdir -p /var/logs/scraper/

# Add GITHUB_TOKEN to Environment variables
echo 'export GITHUB_TOKEN="${GITHUB_TOKEN}"' >> /etc/profile
source /etc/profile

chmod +x src/scrape.sh
./src/scrape.sh >> /var/logs/scraper/scraper.log
