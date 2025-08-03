// app/api/create-video/route.ts
import { supabase } from "app/lib/supabase/client/supabaseClient";
import { VideoInit } from "app/lib/supabase/entities";
import { createVideo, deleteVideo } from "app/lib/supabase/queries";

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, title, duration } = body;

  if (!userId || !title || !duration) {
    return new Response('User ID, Title, and Duration are required', { status: 400 });
  }

  const video: VideoInit = {
    user_id: userId,
    title: title,
    description: 'Uploaded video :)',
    duration: duration,
  }

  const videoId = await createVideo(video);
  if (!videoId) {
    return new Response('Failed to create video', { status: 500 });
  }

  return new Response(JSON.stringify({ videoId }), {
    status: 201,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  if (!videoId) {
    return new Response('Video ID is required', { status: 400 });
  }

  deleteVideo(videoId)
    .then((success) => {
      if (!success) {
        return new Response('Failed to delete video', { status: 500 });
      }
      console.log('Video deleted successfully:', videoId);
      return new Response('Video deleted successfully', { status: 200 });
    });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return new Response('User ID is required', { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching videos:', error);
      return new Response('Failed to fetch videos', { status: 500 });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Unexpected error fetching videos:', err);
    return new Response('Unexpected error occurred', { status: 500 });
  }
}