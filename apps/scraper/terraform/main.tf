terraform {
  backend "s3" {
    bucket       = "uenroll-scraper"
    use_lockfile = true
    key          = "scraper"
    region       = "us-east-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.88"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-1"

  endpoints {
    dynamodb = "uenroll-scraper-terraform-state-lock"
  }
}

data "aws_ami" "latest_amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-arm64"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["arm64"]
  }
}

# --- Networking setup ---
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "scraper-vpc"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"
  tags = {
    Name = "scraper-public-subnet"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "scraper-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "scraper-public-rt"
  }
}

resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "scraper_sg" {
  name        = "uenroll-scraper-sg"
  description = "Allow SSH and HTTP traffic"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "uneroll-scraper-sg"
    Project = "uenroll"
  }
}

resource "tls_private_key" "scraper_private_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "scraper_key_pair" {
  key_name   = "scraper_key_pair"
  public_key = tls_private_key.scraper_private_key.public_key_openssh
}

resource "local_sensitive_file" "local_scraper_private_key" {
  content         = tls_private_key.scraper_private_key.private_key_pem
  filename        = "${path.module}/${aws_key_pair.scraper_key_pair.key_name}.pem"
  file_permission = "400"
}

data "aws_secretsmanager_secret" "db_secret" {
  name = "prod/uenroll/db"
}

data "aws_secretsmanager_secret_version" "db_secret_version" {
  secret_id = data.aws_secretsmanager_secret.db_secret.id
}

data "aws_secretsmanager_secret" "github_secret" {
  name = "prod/uenroll/github"
}

data "aws_secretsmanager_secret_version" "github_secret_version" {
  secret_id = data.aws_secretsmanager_secret.github_secret.id
}

locals {
  database_url = jsondecode(data.aws_secretsmanager_secret_version.db_secret_version.secret_string)["database_url"]
  github_token = jsondecode(data.aws_secretsmanager_secret_version.github_secret_version.secret_string)["github_token"]
}

resource "aws_instance" "scraper" {
  ami                    = data.aws_ami.latest_amazon_linux.id
  instance_type          = "t4g.nano"
  key_name               = aws_key_pair.scraper_key_pair.key_name
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.scraper_sg.id]
  user_data = templatefile("${path.module}/setup.sh", {
    DATABASE_URL = local.database_url
    GITHUB_TOKEN = local.github_token
  })

  ebs_block_device {
    device_name           = "/dev/xvda"
    volume_size           = 30
    volume_type           = "gp3"
    delete_on_termination = true
  }

  tags = {
    Name    = "uenroll-scraper-ec2"
    Project = "uenroll"
  }
}

output "instance_public_ip" {
  value = aws_instance.scraper.public_ip
}
