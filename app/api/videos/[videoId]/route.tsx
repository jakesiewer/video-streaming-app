// app/api/videos/[videoId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { scyllaClient } from '../../../lib/scylla';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import { types } from 'cassandra-driver';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    // Validate and convert videoId to UUID
    let videoUuid: types.Uuid;
    try {
      videoUuid = types.Uuid.fromString(params.videoId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid video ID format' },
        { status: 400 }
      );
    }

    // Get video information from ScyllaDB
    const result = await scyllaClient.execute(
      'SELECT video_url FROM video_streaming.videos WHERE video_id = ?',
      [videoUuid],
      { prepare: true }
    );

    if (!result.rows.length) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const videoPath = join(process.cwd(), 'public', result.rows[0].video_url);

    // Check if file exists and get its stats
    let stat;
    try {
      stat = statSync(videoPath);
    } catch (error) {
      return NextResponse.json(
        { error: 'Video file not found' },
        { status: 404 }
      );
    }

    const fileSize = stat.size;
    const range = request.headers.get('range');

    if (range) {
      // Handle range request (partial content)
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE, fileSize - 1);

      if (start >= fileSize || start < 0 || isNaN(start)) {
        return NextResponse.json(
          { error: 'Invalid range request' },
          { status: 416 } // Range Not Satisfiable
        );
      }

      const contentLength = end - start + 1;
      const stream = createReadStream(videoPath, { start, end });

      const headers = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': contentLength.toString(), // Convert to string
        'Content-Type': 'video/mp4',
      };

      return new NextResponse(stream as any, {
        status: 206, // Partial Content
        headers,
      });
    } else {
      // Handle full file request
      const stream = createReadStream(videoPath);
      const headers = {
        'Content-Length': fileSize.toString(), // Convert to string
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      };

      return new NextResponse(stream as any, {
        status: 200,
        headers,
      });
    }
  } catch (error) {
    console.error('Error streaming video:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
    },
  });
}