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

// Parks with images (these are shown in the game)
const nationalParksData = [
  {
    id: 1,
    name: "Arches National Park",
    imageKey: "arches.jpg",
    state: "Utah",
    hasImage: true,
  },
  {
    id: 2,
    name: "Canyonlands National Park",
    imageKey: "canyonlands.jpg",
    state: "Utah",
    hasImage: true,
  },
  {
    id: 3,
    name: "Denali National Park",
    imageKey: "denali.jpg",
    state: "Alaska",
    hasImage: true,
  },
  {
    id: 4,
    name: "Glacier National Park",
    imageKey: "glacier.jpg",
    state: "Montana",
    hasImage: true,
  },
  {
    id: 5,
    name: "Rocky Mountain National Park",
    imageKey: "rocky-mountain.jpg",
    state: "Colorado",
    hasImage: true,
  },
  {
    id: 6,
    name: "Yosemite National Park",
    imageKey: "yosemite.jpg",
    state: "California",
    hasImage: true,
  },
];

// Additional parks (decoys for wrong answers - no images needed)
const decoyParks = [
  { id: 101, name: "Yellowstone National Park", state: "Wyoming", hasImage: false },
  { id: 102, name: "Grand Canyon National Park", state: "Arizona", hasImage: false },
  { id: 103, name: "Zion National Park", state: "Utah", hasImage: false },
  { id: 104, name: "Grand Teton National Park", state: "Wyoming", hasImage: false },
  { id: 105, name: "Acadia National Park", state: "Maine", hasImage: false },
  { id: 106, name: "Olympic National Park", state: "Washington", hasImage: false },
  { id: 107, name: "Joshua Tree National Park", state: "California", hasImage: false },
  { id: 108, name: "Bryce Canyon National Park", state: "Utah", hasImage: false },
];

export async function GET() {
  try {
    if (!BUCKET_NAME) {
      return NextResponse.json(
        { error: "S3 bucket not configured" },
        { status: 500 }
      );
    }

    // Generate presigned URLs for parks with images
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
          hasImage: true,
        };
      })
    );

    // Combine parks with images and decoy parks
    const allParks = [...parksWithUrls, ...decoyParks];

    return NextResponse.json({
      parks: parksWithUrls,  // Parks that can be shown (have images)
      allParks: allParks      // All parks (for answer options)
    });
  } catch (error) {
    console.error("Error generating presigned URLs:", error);
    return NextResponse.json(
      { error: "Failed to load park data", details: error.message },
      { status: 500 }
    );
  }
}
