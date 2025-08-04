import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const privateKeyPath = path.resolve(process.cwd(), 'private_key.pem');
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await context.params;
  const range = request.headers.get('range');

  if (!range) {
    return new NextResponse('Range header required', { status: 400 });
  }

  const cloudfrontDomain = process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_URL;
  const videoPath = `/user-videos/${videoId}/videos/video.mp4`;

  const signedUrl = getSignedUrl({
    url: `${cloudfrontDomain}${videoPath}`,
    keyPairId: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID!,
    privateKey: privateKey,
    dateLessThan: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 mins expiry
  });

  try {
    const res = await fetch(signedUrl, {
      headers: {
        Range: range,
      },
    });

    // Forward CloudFront response back to client
    const headers = new Headers({
      'Content-Range': res.headers.get('Content-Range') || '',
      'Accept-Ranges': 'bytes',
      'Content-Length': res.headers.get('Content-Length') || '',
      'Content-Type': res.headers.get('Content-Type') || 'video/mp4',
    });

    return new NextResponse(res.body, {
      status: res.status,
      headers,
    });
  } catch (error) {
    console.error('Error streaming from CloudFront:', error);
    return new NextResponse('Error streaming video', { status: 500 });
  }
}