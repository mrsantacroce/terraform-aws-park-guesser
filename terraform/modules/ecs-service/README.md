# ECS Service Module

This module creates a basic ECS Fargate service with:
- ECS Cluster
- ECS Service running on Fargate
- ECR Repository for Docker images
- CloudWatch Logs
- IAM Roles for task execution and task
- Security Group for ECS tasks

## Usage

```hcl
module "ecs" {
  source = "../../modules/ecs-service"

  region         = "us-east-1"
  cluster_name   = "my-cluster"
  service_name   = "my-service"
  container_name = "my-app"
  container_image = "123456789012.dkr.ecr.us-east-1.amazonaws.com/my-app:latest"
  container_port  = 3000

  task_cpu        = "256"
  task_memory_mb  = "512"
  desired_count   = 1

  vpc_id           = "vpc-xxx"
  subnet_ids       = ["subnet-xxx", "subnet-yyy"]
  assign_public_ip = true

  s3_bucket_arn = "arn:aws:s3:::my-bucket"

  tags = {
    Environment = "dev"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| region | AWS region | `string` | n/a | yes |
| cluster_name | Name of the ECS cluster | `string` | n/a | yes |
| service_name | Name of the ECS service | `string` | n/a | yes |
| container_name | Name of the container | `string` | `"app"` | no |
| container_image | Docker image to run | `string` | n/a | yes |
| container_port | Port exposed by container | `number` | `3000` | no |
| task_cpu | CPU units for the task | `string` | `"256"` | no |
| task_memory_mb | Memory for the task in MB | `string` | `"512"` | no |
| desired_count | Desired number of tasks | `number` | `1` | no |
| vpc_id | VPC ID | `string` | n/a | yes |
| subnet_ids | List of subnet IDs | `list(string)` | n/a | yes |
| assign_public_ip | Assign public IP to tasks | `bool` | `true` | no |
| s3_bucket_arn | S3 bucket ARN for access | `string` | `""` | no |
| tags | Tags to apply | `map(string)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| cluster_id | ID of the ECS cluster |
| cluster_name | Name of the ECS cluster |
| service_name | Name of the ECS service |
| ecr_repository_url | URL of the ECR repository |
| security_group_id | ID of the ECS tasks security group |

## Deploying Your Docker Image

After creating the infrastructure:

1. Build your Docker image locally
2. Login to ECR
3. Tag and push your image to ECR
4. ECS will automatically pull and deploy the image

See the `docker_push_commands` output for exact commands.
