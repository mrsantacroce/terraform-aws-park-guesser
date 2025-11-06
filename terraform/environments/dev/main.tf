data "aws_caller_identity" "current" {}

locals {
  account_id   = data.aws_caller_identity.current.account_id
  bucket_name  = "${local.project_name}-${local.account_id}-${var.region}"
  project_name = "park-guesser"
}

# VPC Module
module "vpc" {
  source = "../../modules/vpc"

  vpc_name          = "${local.project_name}-vpc"
  vpc_cidr          = "10.0.0.0/16"
  availability_zone = "${var.region}a"

  tags = {
    Environment = "dev"
    Project     = local.project_name
    ManagedBy   = "terraform"
  }
}

# S3 Module
module "s3" {
  source      = "../../modules/s3-bucket"
  region      = var.region
  bucket_name = local.bucket_name
}

# ECS Module
module "ecs" {
  source = "../../modules/ecs-service"

  region         = var.region
  cluster_name   = "${local.project_name}-cluster"
  service_name   = local.project_name
  container_name = "park-guesser-app"

  # Initial placeholder image
  container_image = "${local.account_id}.dkr.ecr.${var.region}.amazonaws.com/${local.project_name}:latest"
  container_port  = 3000

  # Fargate configuration
  task_cpu       = "256"
  task_memory_mb = "512"
  desired_count  = 0 # Set to 0 initially because Docker image is not yet in ECR

  # Networking - use our VPC
  vpc_id           = module.vpc.vpc_id
  subnet_ids       = [module.vpc.public_subnet_id]
  assign_public_ip = true

  # Grant S3 access to ECS tasks
  s3_bucket_arn = module.s3.bucket_arn

  tags = {
    Environment = "dev"
    Project     = local.project_name
    ManagedBy   = "terraform"
  }
}
