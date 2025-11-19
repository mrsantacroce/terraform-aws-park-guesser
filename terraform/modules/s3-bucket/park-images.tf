# Park images S3 objects
# Note: Place your actual park images in ../../park-images/ directory
# Images remain private and are accessed via ECS task IAM role

locals {
  park_images_path = "${path.module}/../../../park-images"

  park_images = {
    "arches.jpg"          = "arches.jpg"
    "canyonlands.jpg"     = "canyonlands.jpg"
    "denali.jpg"          = "denali.jpg"
    "glacier.jpg"         = "glacier.jpg"
    "rocky-mountain.jpg"  = "rocky-mountain.jpg"
    "yosemite.jpg"        = "yosemite.jpg"
  }
}

# Upload park images to S3 (private - accessed via ECS task IAM role)
resource "aws_s3_object" "park_images" {
  for_each = local.park_images

  bucket       = aws_s3_bucket.this.id
  key          = "images/parks/${each.value}"
  source       = "${local.park_images_path}/${each.value}"
  content_type = "image/jpeg"
  etag         = filemd5("${local.park_images_path}/${each.value}")

  tags = var.tags
}
