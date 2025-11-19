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
  container_image = "${local.account_id}.dkr.ecr.${var.region}.amazonaws.com/${local.project_name}:${var.ecr_image_tag}"
  container_port  = 3000

  # Fargate configuration
  task_cpu       = "256"
  task_memory_mb = "512"
  desired_count  = 1 # Set to 0 initially because Docker image is not yet in ECR

  # Networking - use our VPC
  vpc_id           = module.vpc.vpc_id
  subnet_ids       = [module.vpc.public_subnet_id]
  assign_public_ip = true

  # Security - only allow access from home network
  allowed_cidr_blocks = ["98.97.112.0/24"]

  # Grant S3 access to ECS tasks
  s3_bucket_arn = module.s3.bucket_arn

  # Environment variables for the container
  environment_variables = [
    {
      name  = "AWS_REGION"
      value = var.region
    },
    {
      name  = "S3_BUCKET_NAME"
      value = module.s3.bucket_name
    }
  ]

  tags = {
    Environment = "dev"
    Project     = local.project_name
    ManagedBy   = "terraform"
  }
}

# CloudWatch Alarm Module
module "cloudwatch_alarm" {
  source = "../../modules/cloudwatch-alarm"

  log_group_name     = "/aws/ecs/park-guesser"
  retention_days     = 7
  alarm_name         = "${local.project_name}-hint-usage-alarm"
  metric_name        = "HintUsageCount"
  metric_namespace   = "ParkGuesser"
  threshold          = 1
  period             = 300 # 5 minutes
  evaluation_periods = 1
  environment        = "dev"

  # Optional: Add SNS topic ARN here for email notifications
  # alarm_actions = [aws_sns_topic.alerts.arn]
}
