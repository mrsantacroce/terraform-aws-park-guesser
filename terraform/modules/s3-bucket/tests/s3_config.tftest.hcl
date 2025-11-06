# Simple Terraform test for S3 bucket module
run "plan_s3_bucket" {
  # This runs a 'terraform plan' and makes assertions on the outputs.
  command = plan

  variables {
    bucket_name = "park-guesser-1234567891011-us-test-1"
    region      = "us-east-1"
  }

  # Bucket name must start with "park-guesser-"
  assert {
    condition     = startswith(output.bucket_name, "park-guesser-")
    error_message = "Bucket name must start with 'park-guesser-'."
  }

  # SSE must be enabled (AES256 or aws:kms)
  assert {
    condition     = contains(["AES256", "aws:kms"], coalesce(output.sse_algorithm, ""))
    error_message = "S3 bucket must have server-side encryption enabled (AES256 or KMS)."
  }

  # Versioning must be enabled
  assert {
    condition     = output.versioning_enabled == true
    error_message = "S3 bucket versioning must be enabled."
  }

  # Public access must be blocked (via Public Access Block)
  assert {
    condition     = output.block_public_acls == true
    error_message = "S3 bucket must block public ACLs."
  }
}
