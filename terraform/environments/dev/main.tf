data "aws_caller_identity" "current" {}

locals {
  account_id   = data.aws_caller_identity.current.account_id
  bucket_name  = "${local.project_name}-${local.account_id}-${var.region}"
  project_name = "park-guesser"
}

module "s3" {
  source      = "../../modules/s3-bucket"
  region      = var.region
  bucket_name = local.bucket_name
}
