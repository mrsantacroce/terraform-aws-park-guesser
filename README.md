# terraform-aws-park-guesser
A National Park guessing game hosted on AWS ECS, deployed with Terraform (integration with AWS Bedrock)

![Park Guesser Game](park-guesser-image.png)

## Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture diagrams and infrastructure design
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development guide, setup instructions, and workflows

## Improvements to be made with more time
- Make app span multiple AZs (Currently in one availability zone (us-east-1a) for simplicity), your entire app is down
- Implement Application Load Balancer (ALB) but this will require at least 2 subnets in different AZs
- Better application styling and functionality
- Better error handling
- Add more parks!
