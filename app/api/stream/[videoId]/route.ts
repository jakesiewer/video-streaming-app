// app/api/stream/[videoId]/route.ts
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from 'next/server';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: NextRequest,
  context: { params: { videoId: string } }
) {
  const { videoId } = await context.params;
  const range = request.headers.get('range');

;  if (!range) {
    return new NextResponse('Range header required', { status: 400 });
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `videos/${videoId}.mp4`,
      Range: range,
    });

    const response = await s3.send(command);
    
    const headers = new Headers({
      'Content-Range': response.ContentRange!,
      'Accept-Ranges': 'bytes',
      'Content-Length': response.ContentLength?.toString() || '0',
      'Content-Type': 'video/mp4',
    });

    const stream = response.Body as ReadableStream;

    return new NextResponse(stream, {
      status: 206,
      headers: headers,
    });
  } catch (error) {
    console.error('Error streaming video:', error);
    return new NextResponse('Error streaming video', { status: 500 });
  }
}