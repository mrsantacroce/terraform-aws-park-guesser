# Simple Terraform test for S3 bucket module
run "plan_s3_bucket" {
  # This runs a 'terraform plan' and makes assertions on the outputs.
  command = plan

  variables {
    bucket_name = "park-guesser-1234567891011-us-test-1"
    region      = "us-east-1"
  }

  assert {
    condition     = startswith(output.bucket_name, "park-guesser-")
    error_message = "Bucket name must start with 'park-guesser-'."
  }

  assert {
    condition     = output.sse_algorithm == "AES256" || output.sse_algorithm == "aws:kms"
    error_message = "S3 bucket must have server-side encryption enabled (AES256 or KMS)."
  }
}
