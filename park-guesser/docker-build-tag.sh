#!/bin/bash
# Script to build and tag Docker image with commit SHA

set -e

# Get the short commit SHA
COMMIT_SHA=$(git rev-parse --short HEAD)

# Get the ECR repository URL (if terraform is applied, otherwise use placeholder)
ECR_REPO="${ECR_REPOSITORY_URL:-park-guesser}"

echo "Building Docker image..."
echo "Commit SHA: $COMMIT_SHA"
echo "Repository: $ECR_REPO"

# Build the image
docker build -t park-guesser:latest -t park-guesser:$COMMIT_SHA .

# If ECR_REPOSITORY_URL is set, also tag for ECR
if [ ! -z "$ECR_REPOSITORY_URL" ]; then
  echo "Tagging for ECR..."
  docker tag park-guesser:latest $ECR_REPO:latest
  docker tag park-guesser:latest $ECR_REPO:$COMMIT_SHA

  echo ""
  echo "Images tagged:"
  echo "  - park-guesser:latest"
  echo "  - park-guesser:$COMMIT_SHA"
  echo "  - $ECR_REPO:latest"
  echo "  - $ECR_REPO:$COMMIT_SHA"
  echo ""
  echo "To push to ECR, run:"
  echo "  docker push $ECR_REPO:latest"
  echo "  docker push $ECR_REPO:$COMMIT_SHA"
else
  echo ""
  echo "Images tagged:"
  echo "  - park-guesser:latest"
  echo "  - park-guesser:$COMMIT_SHA"
  echo ""
  echo "To tag for ECR, set ECR_REPOSITORY_URL and run this script again"
fi
