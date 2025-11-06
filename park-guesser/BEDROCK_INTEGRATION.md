# Amazon Bedrock Integration

This app uses Amazon Bedrock with the Titan Text Express model to generate hints for national park guessing.

## How It Works

1. **User clicks "Get Hint"** button with a park name
2. **Next.js API route** (`/api/hint`) receives the request
3. **Bedrock Titan Text** generates a contextual hint about the park
4. **Hint is displayed** to help the user guess the park

## Files

- `src/app/api/hint/route.js` - API endpoint that calls Bedrock
- `src/app/components/HintButton.js` - React component for hint button
- `src/app/components/ParkGuesserDemo.js` - Demo page component

## Local Development

To test locally, you need AWS credentials with Bedrock access:

```bash
# Set AWS profile
export AWS_PROFILE=awsly
export AWS_REGION=us-east-1

# Run the dev server
npm run dev
```

Visit http://localhost:3000 and try the hint feature!

## IAM Permissions

The ECS task role has been configured with:
- `bedrock:InvokeModel` permission for `amazon.titan-text-express-v1`

See `terraform/modules/ecs-service/iam.tf` for details.

## Bedrock Model Access

**IMPORTANT**: Before using Bedrock, you must enable model access in the AWS Console:

1. Go to AWS Bedrock console
2. Click "Model access" in the left sidebar
3. Click "Enable specific models"
4. Enable "Titan Text G1 - Express"
5. Wait for access to be granted (usually instant)

## API Usage

```javascript
// POST /api/hint
{
  "parkName": "Yosemite National Park"
}

// Response
{
  "hint": "This iconic California park is famous for its granite cliffs...",
  "parkName": "Yosemite National Park"
}
```

## Cost Considerations

- Titan Text Express: ~$0.0002 per 1K input tokens, ~$0.0006 per 1K output tokens
- Very cost-effective for hint generation
- Each hint request costs less than $0.001
