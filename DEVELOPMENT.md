# Development Guide

## How to Run Locally

### Prerequisites

- **Node.js 22** or higher
- **Docker** and **Docker Compose**
- **AWS CLI** configured with the `awsly` profile
- **AWS Bedrock** access (Titan Text Express model enabled in us-east-1)

### Service Details

- **Service Name**: Park Guesser
- **Exposed Port**: `3000` (HTTP)
- **Local URL**: http://localhost:3000
- **Container Runtime**: Node 22 Alpine
- **Framework**: Next.js 16 (React 19)

## Running the Service

### Quickstart with Docker Compose (Recommended)

1. **Build and run with Docker Compose**
   ```bash
   cd park-guesser
   ./run-docker-local.sh
   ```

   This script will:
   - Export AWS credentials from your `awsly` profile
   - Build the Docker image with production configuration
   - Start the container with proper credentials

2. **Access the app**

   Open http://localhost:3000 in your browser

3. **View logs**
   ```bash
   docker-compose logs -f
   ```

4. **Rebuild after code changes**
   ```bash
   docker-compose up --build
   ```

5. **Stop the container**
   ```bash
   docker-compose down
   ```

### Alternative: Build and Run Manually

#### Step 1: Build the Docker Image

The Dockerfile uses a multi-stage build process:

```bash
cd park-guesser

# Build the image
docker build -t park-guesser:local .
```

**Build stages:**
1. **deps**: Install dependencies with `npm ci`
2. **builder**: Build Next.js app with `npm run build`
3. **runner**: Production image with minimal footprint

The build process:
- Uses Node 22 Alpine base image
- Installs dependencies from package-lock.json (deterministic)
- Compiles Next.js app with standalone output
- Creates non-root user (nextjs:nodejs)
- Exposes port 3000

#### Step 2: Run the Container

```bash
# Export AWS credentials from awsly profile
export $(aws configure export-credentials --profile awsly --format env)

# Run the container
docker run -d \
  --name park-guesser \
  -p 3000:3000 \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -e AWS_SESSION_TOKEN=$AWS_SESSION_TOKEN \
  -e AWS_REGION=us-east-1 \
  park-guesser:local

# View logs
docker logs -f park-guesser

# Stop the container
docker stop park-guesser
docker rm park-guesser
```

#### Step 3: Build with Commit SHA Tag (for deployment)

```bash
./docker-build-tag.sh
```

This script:
- Extracts git commit SHA
- Builds image tagged with both `latest` and commit SHA
- Optionally tags for ECR if `ECR_REPOSITORY_URL` is set

## Testing the Service

### Manual Testing

Once the service is running on http://localhost:3000:

1. **Test the frontend**
   - Navigate to http://localhost:3000
   - Verify the page loads with a park image
   - Check that 4 multiple choice options are displayed
   - Verify the gradient header renders correctly

2. **Test the game flow**
   - Select an answer and click "Submit"
   - Verify correct/incorrect feedback (green/red)
   - Click "Next Park" to load a new question
   - Confirm new park image and options appear

3. **Test the hint system**
   - Click "Get Hint" button
   - Verify hint appears without revealing park name
   - Check that hint is contextually relevant
   - Try getting a second hint (should show same hint)

4. **Test AWS Bedrock integration**
   - Monitor container logs for Bedrock API calls:
     ```bash
     docker-compose logs -f
     ```
   - Look for successful API responses (no error messages)
   - Verify CloudWatch logging (HINT_USED events)

### Health Checks

**Check container is running:**
```bash
docker ps | grep park-guesser
```

**Check container logs:**
```bash
docker-compose logs -f park-guesser
# or
docker logs -f park-guesser
```

**Expected log output:**
```
▲ Next.js 16.0.1
- Local:        http://0.0.0.0:3000
✓ Ready in 500ms
```

**Test HTTP endpoint:**
```bash
curl http://localhost:3000
# Should return HTML with park guesser content

curl -X POST http://localhost:3000/api/hint \
  -H "Content-Type: application/json" \
  -d '{"parkName": "Yellowstone National Park"}'
# Should return JSON with hint
```

### Verifying AWS Integration

**Check Bedrock access:**
```bash
aws bedrock list-foundation-models \
  --region us-east-1 \
  --profile awsly \
  --query 'modelSummaries[?modelId==`amazon.titan-text-express-v1`]'
```

**Check CloudWatch logs (if deployed to ECS):**
```bash
aws logs tail /aws/ecs/park-guesser \
  --follow \
  --region us-east-1 \
  --profile awsly
```

## Troubleshooting

### AWS Credentials Issues

If you see "Could not load credentials from any providers":

1. Verify your AWS profile is configured:
   ```bash
   aws configure list --profile awsly
   ```

2. For Docker, ensure `run-docker-local.sh` has execute permissions:
   ```bash
   chmod +x run-docker-local.sh
   ```

### Bedrock Access Issues

If hints fail with a 500 error:

1. Verify Bedrock model access in AWS Console:
   - Navigate to Bedrock → Model access
   - Ensure "Titan Text Express" is enabled

2. Check IAM permissions for your AWS profile

### Port Already in Use

If port 3000 is already in use:

```bash
# Find the process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

## Project Structure

```
park-guesser/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── hint/
│   │   │       └── route.js          # Bedrock API integration
│   │   ├── components/
│   │   │   ├── ParkGuesserDemo.js    # Main game component
│   │   │   └── HintButton.js         # AI hint component
│   │   ├── data/
│   │   │   └── parks.js              # National parks data
│   │   ├── page.js                   # Home page
│   │   ├── layout.js                 # Root layout
│   │   └── globals.css               # Global styles
│   └── ...
├── Dockerfile                         # Multi-stage production build
├── docker-compose.yml                 # Local Docker development
├── docker-build-tag.sh               # Build script with git SHA tags
├── run-docker-local.sh               # Docker run with AWS credentials
└── package.json                       # Dependencies and scripts
```

## Docker Commands

- `./run-docker-local.sh` - Build and run with AWS credentials
- `docker-compose up --build` - Rebuild and start container
- `docker-compose logs -f` - Follow container logs
- `docker-compose down` - Stop and remove container
- `./docker-build-tag.sh` - Build image with git commit SHA tag

## Environment Variables

### Local Development (Docker)
Environment variables are automatically injected by `run-docker-local.sh`:
- `AWS_ACCESS_KEY_ID` - From awsly profile
- `AWS_SECRET_ACCESS_KEY` - From awsly profile
- `AWS_SESSION_TOKEN` - From awsly profile (if using SSO)
- `AWS_REGION` - Set to us-east-1

### Production (ECS)
- `AWS_REGION` - AWS region (injected by ECS)
- Credentials automatically provided via IAM task role

## Next Steps

- See [ARCHITECTURE.md](./ARCHITECTURE.md) for system architecture
- See [README.md](./README.md) for deployment instructions
