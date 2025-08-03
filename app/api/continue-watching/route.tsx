// app/api/continue-watching/route.tsx

import { NextRequest, NextResponse } from 'next/server';
import { scyllaClient } from 'app/lib/scylla/client';
import { Video } from 'app/lib/supabase/entities';
import { types } from 'cassandra-driver';
import { getListOfVideos } from 'app/lib/supabase/queries';

export async function GET(request: NextRequest) {
  try {
    console.log('Getting continue watching');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let userUuid: types.Uuid;
    try {
      userUuid = types.Uuid.fromString(userId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
  
    const watchedResults = await scyllaClient.execute(
      'SELECT video_id, timestamp FROM video_streaming.watch_progress WHERE user_id = ?',
      [userUuid],
      { prepare: true }
    );

    if (!watchedResults.rows.length) {
      return NextResponse.json({ videos: [] });
    }

    const watchedIds: string[] = watchedResults.rows.map((row: types.Row) => row.video_id.toString());

    const videoResults = await getListOfVideos(watchedIds);

    if (!videoResults.length) {
      return NextResponse.json({ videos: [] });
    }

    const videos: (Video & { progress: number })[] = [];

    for (const video of videoResults) {
      const progress = watchedResults.rows.find((watched: any) => watched.video_id.toString() === video.video_id.toString())?.timestamp || 0;
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