#!/bin/bash

# Update system
sudo yum update -y

# Set up docker
sudo amazon-linux-extras install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

# Install git
sudo yum install git -y

# Install deno
curl -fsSL https://deno.land/x/install/install.sh | sh -s -- -y
export DENO_INSTALL="$HOME/.deno"
export PATH="$DENO_INSTALL/bin:$PATH"

# Add Deno to path
echo 'export DENO_INSTALL="$HOME/.deno"' >> "$HOME/.bashrc"
echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >>  "$HOME/.bashrc"
source "$HOME/.bashrc"

# Clone repo
WORK_DIR="/scraper"
git clone https://github.com/g-raman/scraper.git "$WORK_DIR"

# Add API key to .env
echo "DATABASE_URL=\"${DATABASE_URL}\"" >> "$HOME/scraper/.env"

# Install dependencies
cd "$WORK_DIR"
deno install

# Make director to store logs
mkdir -p /var/logs/scraper/

chmod +x src/scrape.sh
./src/scrape.sh >> /var/logs/scraper/scraper.log
