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
    values = ["amzn2-ami-hvm-*"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_security_group" "scraper_sg" {
  name        = "uenroll-scraper-sg"
  description = "Allow SSH and HTTP traffic"

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
  instance_type          = "t2.micro"
  key_name               = aws_key_pair.scraper_key_pair.key_name
  vpc_security_group_ids = [aws_security_group.scraper_sg.id]
  user_data = templatefile("${path.module}/setup.sh", {
    DATABASE_URL = local.database_url
    GITHUB_TOKEN = local.github_token
  })

  tags = {
    Name    = "uenroll-scraper-ec2"
    Project = "uenroll"
  }
}

output "instance_public_ip" {
  value = aws_instance.scraper.public_ip
}
