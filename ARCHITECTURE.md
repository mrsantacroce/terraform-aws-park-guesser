# Architecture

## System Overview

The Park Guesser application is a serverless web application that uses Amazon Bedrock for AI-powered hints about national parks. The infrastructure is fully managed by Terraform and deployed on AWS ECS Fargate.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          User's Browser                             │
│                    http://<PUBLIC_IP>:3000                          │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ HTTP
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Security Group                               │
│                  (98.97.112.0/24 - Home Network)                    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         AWS VPC (10.0.0.0/16)                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │               Public Subnet (10.0.0.0/24)                     │  │
│  │  ┌────────────────────────────────────────────────────────┐  │  │
│  │  │             ECS Fargate Task                           │  │  │
│  │  │  ┌──────────────────────────────────────────────────┐  │  │  │
│  │  │  │        Next.js App (Node 22)                     │  │  │  │
│  │  │  │        - React Frontend                          │  │  │  │
│  │  │  │        - /api/hint endpoint                      │  │  │  │
│  │  │  │        - Port 3000                               │  │  │  │
│  │  │  └──────────────────────────────────────────────────┘  │  │  │
│  │  │                                                        │  │  │
│  │  │  IAM Task Role:                                       │  │  │
│  │  │  - bedrock:InvokeModel                               │  │  │
│  │  │  - s3:GetObject (park images)                        │  │  │
│  │  │  - logs:PutLogEvents                                 │  │  │
│  │  └────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Internet Gateway ─────────────┐                                   │
└────────────────────────────────┼───────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
    ┌──────────────────────┐        ┌──────────────────────┐
    │   Amazon Bedrock     │        │    Amazon S3         │
    │                      │        │                      │
    │  Titan Text Express  │        │  Park Images Bucket  │
    │  (AI Hint Generation)│        │                      │
    └──────────────────────┘        └──────────────────────┘
                 │
                 ▼
    ┌──────────────────────┐
    │   CloudWatch Logs    │
    │                      │
    │  /aws/ecs/park-guesser   (Container logs)         │
    │  /aws/ecs/park-guesser   (Hint usage events)      │
    │                      │
    │  Metric Filter:      │
    │  - HINT_USED events  │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │  CloudWatch Alarm    │
    │                      │
    │  Threshold: 1 hint   │
    │  Period: 5 minutes   │
    │  (Monitors usage)    │
    └──────────────────────┘
```

## Component Details

### Frontend (Next.js React App)

- **Technology**: Next.js 16, React 19, Tailwind CSS
- **Build**: Multi-stage Docker build with Node 22
- **Features**:
  - Image-based park guessing game
  - Multiple choice interface
  - AI-powered hint system
  - Real-time answer validation

### Backend API

- **Endpoint**: `POST /api/hint`
- **Functionality**:
  1. Receives park name from frontend
  2. Invokes Amazon Bedrock Titan Text Express
  3. Generates contextual hints without revealing the answer
  4. Logs hint usage to CloudWatch for monitoring

### Infrastructure

#### ECS Fargate

- **Cluster**: `park-guesser-cluster`
- **Service**: `park-guesser`
- **Task Definition**:
  - CPU: 256 units (0.25 vCPU)
  - Memory: 512 MB
  - Container: Node 22 Alpine
  - Networking: awsvpc mode with public IP

#### Networking

- **VPC**: Custom VPC (10.0.0.0/16)
- **Subnet**: Single public subnet with Internet Gateway
- **Security Group**:
  - Ingress: Port 3000 from home network (98.97.118.0/24)
  - Egress: All traffic (for AWS API calls)

#### IAM Roles

- **Task Execution Role**: Pull images from ECR, write container logs
- **Task Role**:
  - Bedrock model invocation
  - S3 bucket access (park images)
  - CloudWatch Logs access (hint usage logging)

#### Monitoring

- **CloudWatch Log Groups**:
  - `/ecs/park-guesser` - Container stdout/stderr
  - `/aws/ecs/park-guesser` - Hint usage events

- **CloudWatch Alarm**:
  - Metric: `ParkGuesser/HintUsageCount`
  - Threshold: ≥ 1 hint used in 5 minutes
  - Purpose: Monitor application usage patterns

### CI/CD Pipeline

#### Terraform Workflow (.github/workflows/terraform.yml)

Triggers: Push/PR to main

1. Format check
2. S3 module tests
3. Terraform init, validate, plan
4. Apply (main branch only)

#### Docker Build Workflow (.github/workflows/docker-build.yml)

Triggers: Changes to `park-guesser/**`

1. Build Docker image with Node 22
2. Tag with git commit SHA
3. Push to ECR
4. Manual deployment via Terraform variable update

## Data Flow

### Game Flow

1. User loads page → React app renders
2. Random park selected from data/parks.js
3. Image displayed with 4 multiple choice options
4. User submits answer → Client-side validation
5. Correct/incorrect feedback displayed
6. Next park button to continue

### Hint Generation Flow

1. User clicks "Get Hint"
2. Frontend → `POST /api/hint` with park name
3. API constructs prompt with strict rules
4. Bedrock Titan Text Express generates hint
5. **Hint logged to CloudWatch** (event: HINT_USED)
6. Hint returned to frontend
7. CloudWatch metric filter counts HINT_USED events
8. Alarm triggers if threshold exceeded

## Security

- **Network Isolation**: Security group restricts access to home network only
- **No Secrets in Code**: AWS credentials via IAM roles (ECS) or profiles (local)
- **Container Security**: Non-root user (nextjs:nodejs), minimal Alpine base
- **Immutable Infrastructure**: Terraform-managed resources
- **Immutable Images**: ECR repository enforces immutable tags

## Scalability

- **Fargate Auto-scaling**: Can be configured based on CPU/memory
- **Stateless Design**: No session storage, fully stateless
- **CloudWatch Monitoring**: Metrics available for autoscaling decisions

## Cost Optimization

- **Minimal Resources**: 0.25 vCPU, 512 MB RAM
- **Single AZ**: No cross-AZ data transfer costs
- **On-demand Bedrock**: Pay per API call
- **7-day Log Retention**: Reduce CloudWatch storage costs

## Deployment

See [README.md](README.md) for deployment instructions.

## Local Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for local development setup.
