output "bucket_name" {
  description = "The name of the S3 bucket."
  value       = aws_s3_bucket.this.bucket
}

output "bucket_arn" {
  description = "The ARN of the S3 bucket."
  value       = aws_s3_bucket.this.arn
}

output "versioning_enabled" {
  description = "True if bucket versioning is enabled."
  value       = try(aws_s3_bucket_versioning.this.versioning_configuration[0].status == "Enabled", false)
}

output "sse_algorithm" {
  description = "The SSE algorithm applied to the S3 bucket (AES256 or aws:kms)."
  value = try(
    tolist(aws_s3_bucket_server_side_encryption_configuration.this.rule)[0]
    .apply_server_side_encryption_by_default[0]
    .sse_algorithm,
    null
  )
}

output "block_public_acls" {
  description = "Whether public ACLs are blocked for the bucket."
  value       = try(aws_s3_bucket_public_access_block.this.block_public_acls, false)
}
