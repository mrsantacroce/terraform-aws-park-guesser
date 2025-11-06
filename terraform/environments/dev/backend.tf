terraform {
  backend "s3" {
    bucket         = "terraform-state-381492209450-us-east-1"
    key            = "park-guesser/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}
