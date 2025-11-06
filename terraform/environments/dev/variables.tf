variable "region" {
  description = "AWS region for resources to be deployed into"
  type        = string
}

variable "ecr_image_tag" {
  description = "The image tag to use in the ECS deployment from the ECR repo"
}