import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { CloudWatchLogsClient, PutLogEventsCommand, CreateLogStreamCommand, DescribeLogStreamsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { fromIni } from "@aws-sdk/credential-providers";
import { NextResponse } from "next/server";

// Initialize Bedrock client
// When running in ECS, it will automatically use the IAM role
// For local development, use AWS_PROFILE from .env.local
const clientConfig = {
  region: process.env.AWS_REGION || "us-east-1",
};

// If AWS_PROFILE is set (local dev), use profile credentials
if (process.env.AWS_PROFILE) {
  clientConfig.credentials = fromIni({ profile: process.env.AWS_PROFILE });
}

const client = new BedrockRuntimeClient(clientConfig);
const logsClient = new CloudWatchLogsClient(clientConfig);

// CloudWatch Logs configuration
const LOG_GROUP_NAME = "/aws/ecs/park-guesser";
const LOG_STREAM_NAME = `hints/${new Date().toISOString().split('T')[0]}`; // Daily log stream

// Helper function to log hint usage to CloudWatch
async function logHintUsage(parkName, hint) {
  try {
    // Try to create the log stream (will fail if it already exists, which is fine)
    try {
      await logsClient.send(new CreateLogStreamCommand({
        logGroupName: LOG_GROUP_NAME,
        logStreamName: LOG_STREAM_NAME,
      }));
    } catch (err) {
      // Stream already exists, continue
    }

    // Get the sequence token for the log stream
    const describeResponse = await logsClient.send(new DescribeLogStreamsCommand({
      logGroupName: LOG_GROUP_NAME,
      logStreamNamePrefix: LOG_STREAM_NAME,
    }));

    const sequenceToken = describeResponse.logStreams?.[0]?.uploadSequenceToken;

    // Put the log event
    const logEvent = {
      logGroupName: LOG_GROUP_NAME,
      logStreamName: LOG_STREAM_NAME,
      logEvents: [
        {
          message: JSON.stringify({
            event: "HINT_USED",
            parkName,
            hint,
            timestamp: new Date().toISOString(),
          }),
          timestamp: Date.now(),
        },
      ],
    };

    if (sequenceToken) {
      logEvent.sequenceToken = sequenceToken;
    }

    await logsClient.send(new PutLogEventsCommand(logEvent));
    console.log("Hint usage logged to CloudWatch");
  } catch (error) {
    console.error("Failed to log to CloudWatch:", error);
    // Don't fail the request if logging fails
  }
}

export async function POST(request) {
  try {
    const { parkName } = await request.json();

    if (!parkName) {
      return NextResponse.json(
        { error: "Park name is required" },
        { status: 400 }
      );
    }

    // Create prompt for Bedrock Titan
    const prompt = `You are helping someone guess a national park in a game. Generate a helpful hint about ${parkName}.

CRITICAL RULES:
- DO NOT mention "${parkName}" or any part of its name in your response
- DO NOT mention the state name if it's part of the park name (e.g., for "Yellowstone", don't say Wyoming/Montana/Idaho)
- Give clues about unique features, geological formations, wildlife, or historical significance
- Keep the hint to 1-2 sentences
- Make the hint challenging but fair

Hint:`;

    // Prepare the request for Amazon Titan Text Express
    const payload = {
      inputText: prompt,
      textGenerationConfig: {
        maxTokenCount: 150,
        temperature: 0.7,
        topP: 0.9,
      },
    };

    // Invoke Bedrock model
    const command = new InvokeModelCommand({
      modelId: "amazon.titan-text-express-v1",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload),
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Extract the hint from the response
    const hint = responseBody.results[0].outputText.trim();

    // Log hint usage to CloudWatch
    await logHintUsage(parkName, hint);

    return NextResponse.json({ hint, parkName });
  } catch (error) {
    console.error("Error calling Bedrock:", error);
    return NextResponse.json(
      { error: "Failed to generate hint", details: error.message },
      { status: 500 }
    );
  }
}
