resource "aws_s3_bucket" "bucket" {
  bucket = var.bucket_name
  tags   = var.tags
}

resource "aws_s3_bucket_versioning" "bucket" {
  bucket = aws_s3_bucket.bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

# resource "aws_s3_bucket_server_side_encryption_configuration" "bucket" {
#   bucket = aws_s3_bucket.tf_state.id

#   rule {
#     apply_server_side_encryption_by_default {
#       sse_algorithm     = var.kms_key_arn != null ? "aws:kms" : "AES256"
#       kms_master_key_id = var.kms_key_arn
#     }
#     bucket_key_enabled = var.kms_key_arn != null ? true : false
#   }
# }

# resource "aws_s3_bucket_public_access_block" "bucket" {
#   bucket = aws_s3_bucket.bucket.id

#   block_public_acls       = true
#   block_public_policy     = true
#   ignore_public_acls      = true
#   restrict_public_buckets = true
# }
