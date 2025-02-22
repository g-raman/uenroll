#!/bin/bash

echo "Updating system..."
sudo yum update -y

echo "Installing git..."
sudo yum install git -y

echo "Installing docker..."
sudo amazon-linux-extras install docker -y

echo "Setting up docker..."
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user

echo "Installing deno..."
curl -fsSL https://deno.land/x/install/install.sh | sh -s -- -y

echo "Setting up deno..."
echo 'export DENO_INSTALL="$HOME/.deno"' >> ~/.bashrc
echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

echo "Installing jq..."
sudo yum install jq -y

echo "Cloning scraper repo..."
git clone https://github.com/uoEnroll/scraper.git
cd scraper
deno install
