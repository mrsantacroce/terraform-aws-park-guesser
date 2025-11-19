import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fromIni } from "@aws-sdk/credential-providers";
import { NextResponse } from "next/server";

// Initialize S3 client
// When running in ECS, it will automatically use the IAM role
// For local development, use AWS_PROFILE from .env.local
const clientConfig = {
  region: process.env.AWS_REGION || "us-east-1",
};

// If AWS_PROFILE is set (local dev), use profile credentials
if (process.env.AWS_PROFILE) {
  clientConfig.credentials = fromIni({ profile: process.env.AWS_PROFILE });
}

const s3Client = new S3Client(clientConfig);

// Get bucket name from environment variable
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Park data with S3 image keys
const nationalParksData = [
  {
    id: 1,
    name: "Arches National Park",
    imageKey: "arches.jpg",
    state: "Utah",
  },
  {
    id: 2,
    name: "Canyonlands National Park",
    imageKey: "canyonlands.jpg",
    state: "Utah",
  },
  {
    id: 3,
    name: "Denali National Park",
    imageKey: "denali.jpg",
    state: "Alaska",
  },
  {
    id: 4,
    name: "Glacier National Park",
    imageKey: "glacier.jpg",
    state: "Montana",
  },
  {
    id: 5,
    name: "Rocky Mountain National Park",
    imageKey: "rocky-mountain.jpg",
    state: "Colorado",
  },
  {
    id: 6,
    name: "Yosemite National Park",
    imageKey: "yosemite.jpg",
    state: "California",
  },
];

export async function GET() {
  try {
    if (!BUCKET_NAME) {
      return NextResponse.json(
        { error: "S3 bucket not configured" },
        { status: 500 }
      );
    }

    // Generate presigned URLs for all park images
    const parksWithUrls = await Promise.all(
      nationalParksData.map(async (park) => {
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `images/parks/${park.imageKey}`,
        });

        // Generate presigned URL valid for 1 hour
        const imageUrl = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return {
          id: park.id,
          name: park.name,
          imageUrl,
          state: park.state,
        };
      })
    );

    return NextResponse.json({ parks: parksWithUrls });
  } catch (error) {
    console.error("Error generating presigned URLs:", error);
    return NextResponse.json(
      { error: "Failed to load park data", details: error.message },
      { status: 500 }
    );
  }
}
