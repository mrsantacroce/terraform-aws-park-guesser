# Park Images Directory

This directory contains the national park images that will be uploaded to S3.

## Required Images

Place the following image files in this directory:

1. **arches.jpg** - Arches National Park (Utah)
2. **canyonlands.jpg** - Canyonlands National Park (Utah)
3. **denali.jpg** - Denali National Park (Alaska)
4. **glacier.jpg** - Glacier National Park (Montana)
5. **rocky-mountain.jpg** - Rocky Mountain National Park (Colorado)
6. **yosemite.jpg** - Yosemite National Park (California)

## Image Requirements

- **Format**: JPEG (.jpg) - **required**
- **Size**: Any size will work! Recommended 800-1200px width for optimal loading
- **Aspect ratio**: Any ratio works - the app will handle it gracefully
- **File size**: Smaller is better for faster loading, but any size will work

## How It Works

1. Add your images to this directory with the exact filenames listed above
2. Run `terraform apply` to upload the images to your S3 bucket
3. The application will automatically serve these images using presigned URLs
4. Images remain private in S3 and are accessed via the ECS task's IAM role

## Finding Images

You can download appropriate park images from:
- Unsplash.com (free, high-quality photos)
- National Park Service official photos (public domain)
- Your own photos if you've visited these parks!

Make sure to use images you have permission to use.
