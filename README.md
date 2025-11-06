# terraform-aws-park-guesser
A National Park guessing game hosted on AWS ECS, deployed with Terraform (integration with AWS Bedrock)

![Park Guesser Game](park-guesser-image.png)

## Improvements to be made with more time
- Make app span multiple AZs (Currently in one availability zone (us-east-1a) for simplicity), your entire app is down
- Implement Application Load Balancer (ALB) but this will require at least 2 subnets in different AZs
- Better application styling and functionality
- Clear errors in app related to images
- actually store the images in s3

## App Architecture


