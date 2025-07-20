// app/api/upload-url/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  const videoId = uuidv4();
  const fileExtension = 'mp4';
  const key = `user-videos/${videoId}/videos/video.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: 'video/mp4',
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour

  return NextResponse.json({
    uploadUrl: url,
    videoId,
    key,
  });
}