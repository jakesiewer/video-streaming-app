// app/api/continue-watching/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { scyllaClient } from 'app/lib/scylla';
import { mapRowToVideo } from 'app/lib/entities/mappings';
import { Video } from 'app/lib/entities/models';
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
      'SELECT video_id, timestamp FROM video_streaming.watch_progress WHERE user_id = ?',
      [userUuid],
      { prepare: true }
    );

    const watchedIds = watchedResults.rows.map((row: types.Row) => row.video_id);

    // Get video information from ScyllaDB
    const videoResults = await scyllaClient.execute(
      'SELECT * FROM video_streaming.videos WHERE video_id IN ?',
      [watchedIds],
      { prepare: true }
    );

    if (!videoResults.rows.length) {
      return NextResponse.json({ videos: [] });
    }

    const videos: (Video & { progress: number })[] = [];
    
    for (let i = 0; i < videoResults.rows.length; i++) {
      const row = videoResults.rows[i];
      const video = mapRowToVideo(row);
      const progress = watchedResults.rows.find(watched => watched.video_id.toString() === video.video_id.toString())?.timestamp || 0;
      videos.push({ ...video, progress });
    }

    return NextResponse.json({ videos });
    
  } catch (error) {
    console.error('Error fetching continue watching:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}