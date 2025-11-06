import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { NextResponse } from "next/server";

// Initialize Bedrock client
// When running in ECS, it will automatically use the IAM role
// For local development, use AWS_PROFILE environment variable
const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

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
    const prompt = `Generate a helpful hint for someone trying to guess the national park: ${parkName}.
The hint should be interesting and give clues about the park's features, location, or characteristics without directly naming it.
Keep the hint to 1-2 sentences.

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

    return NextResponse.json({ hint, parkName });
  } catch (error) {
    console.error("Error calling Bedrock:", error);
    return NextResponse.json(
      { error: "Failed to generate hint", details: error.message },
      { status: 500 }
    );
  }
}
