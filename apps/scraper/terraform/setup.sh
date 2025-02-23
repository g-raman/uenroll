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

echo 'export DENO_INSTALL="$HOME/.deno"' >> "$HOME/.bashrc"
echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >>  "$HOME/.bashrc"
source "$HOME/.bashrc"

# Install jq
sudo yum install jq -y


# Clone repo
WORK_DIR="/scraper"
git clone https://github.com/uoEnroll/scraper.git "$WORK_DIR"
cd "$WORK_DIR"

# Install dependencies
deno install
