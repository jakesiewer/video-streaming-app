import { supabase } from "./client/supabaseClient";
import { Video, VideoInit } from "./entities";

export async function getAllVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*');

  if (error) {
    console.error('Error fetching all videos:', error);
    return [];
  }

  const videos: Video[] = data.map(video => ({
    video_id: video.video_id,
    user_id: video.user_id,
    title: video.title,
    description: video.description,
    created_at: video.created_at,
    duration: video.duration,
  }));
  return videos;
}

export async function getVideosForUser(userId: string) {
  if (!userId) {
    console.error('User ID is required to fetch videos');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching videos:', error);
        return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching videos:', err);
    return [];
  }
}

export async function getListOfVideos(videoIds: string[]): Promise<Video[]> {
  if (!videoIds || videoIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .in('video_id', videoIds);

  if (error) {
    console.error('Error fetching list of videos ids:', error);
    return [];
  }

  return data.map(mapVideoData);
}

export async function getVideoDetails(videoId: string) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('video_id', videoId)
      .single();

    if (error) {
      console.error('Error fetching video:', error);
      return null;
    }

    if (!data) {
      console.log('No video found');
      return null;
    }

    return mapVideoData(data);
  } catch (error) {
    console.error('Unexpected error fetching video:', error);
    return null;
  }
}

export async function deleteVideo(videoId: string) {
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('video_id', videoId);
  if (error) {
    console.error('Error deleting video:', error);
    return false;
  }
  console.log('Video deleted successfully:', videoId);
  return true;
}

export async function createVideo(video: VideoInit) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .insert([video])
      .select();

    if (error) {
      console.error('Error creating video:', error);
      return false;
    }

    console.log('Video created successfully:', data);
    return data[0]?.video_id;
  } catch (error) {
    console.error('Unexpected error creating video:', error);
    return false;
  }
}

function mapVideoData(video: any): Video {
  return {
    video_id: video.video_id,
    user_id: video.user_id,
    title: video.title,
    description: video.description || '',
    duration: video.duration || 0,
    created_at: new Date(video.created_at),
  };
}