# S3 Outputs
output "s3_bucket_name" {
  description = "Name of the S3 bucket for park images"
  value       = module.s3.bucket_name
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = module.s3.bucket_arn
}

# ECS Outputs
output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.ecs.service_name
}

output "ecr_repository_url" {
  description = "URL of the ECR repository - push your Docker images here"
  value       = module.ecs.ecr_repository_url
}

output "docker_push_commands" {
  description = "Commands to push your Docker image to ECR"
  value       = <<-EOT
    # Login to ECR
    aws ecr get-login-password --region ${var.region} --profile awsly | docker login --username AWS --password-stdin ${module.ecs.ecr_repository_url}

    # Tag your local image
    docker tag park-guesser:latest ${module.ecs.ecr_repository_url}:latest

    # Push to ECR
    docker push ${module.ecs.ecr_repository_url}:latest
  EOT
}

output "ecs_task_public_ips_info" {
  description = "How to get the public IP of your ECS task"
  value       = "Run: aws ecs list-tasks --cluster ${module.ecs.cluster_name} --region ${var.region} | jq -r '.taskArns[]' | xargs -I {} aws ecs describe-tasks --cluster ${module.ecs.cluster_name} --tasks {} --region ${var.region} | jq -r '.tasks[].attachments[].details[] | select(.name==\"networkInterfaceId\") | .value' | xargs -I {} aws ec2 describe-network-interfaces --network-interface-ids {} --region ${var.region} | jq -r '.NetworkInterfaces[].Association.PublicIp'"
}
