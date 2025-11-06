#!/bin/bash
# Script to run Docker locally with AWS credentials

echo "Loading AWS credentials from awsly profile..."

# Export AWS credentials from profile
export AWS_PROFILE=awsly
export AWS_REGION=us-east-1

# Get credentials and export them
eval $(aws configure export-credentials --profile awsly --format env)

# Run docker-compose
docker-compose down
docker-compose up --build

