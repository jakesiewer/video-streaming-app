// app/api/continue-watching/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { scyllaClient, Video } from 'app/lib/scylla';
import { mapRowToVideo } from 'app/lib/scylla';
import { createReadStream, statSync } from 'fs';
import { join } from 'path';
import { types } from 'cassandra-driver';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export async function GET(request: NextRequest) {
  try {
    console.log('Getting continue watching');
    
    // Get userId from searchParams
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate and convert userId to UUID
    let userUuid: types.Uuid;
    try {
      userUuid = types.Uuid.fromString(userId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
  
    // Get watched video information from ScyllaDB
    const watchedResults = await scyllaClient.execute(
      'SELECT video_id FROM video_streaming.watch_progress WHERE user_id = ?',
      [userUuid],
      { prepare: true }
    );

    const watchedIds = watchedResults.rows.map(row => row.video_id);

    // Get video information from ScyllaDB
    const videoResults = await scyllaClient.execute(
      'SELECT * FROM video_streaming.videos WHERE video_id IN ?',
      [watchedIds],
      { prepare: true }
    );

    if (!videoResults.rows.length) {
      return NextResponse.json({ videos: [] });
    }

    const videos: Video[] = videoResults.rows.map(row => mapRowToVideo(row));

    return NextResponse.json({ videos });
    
  } catch (error) {
    console.error('Error fetching continue watching:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}