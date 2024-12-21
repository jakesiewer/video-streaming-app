import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { types } from 'cassandra-driver';
import VideoPlayer from '../../components/VideoPlayer';
import { dbOperations } from '../../lib/scylla';

interface PageProps {
  params: {
    videoId: string;
  };
  searchParams: {
    t?: string;  // timestamp parameter for continuing from a specific point
  };
}

async function getVideoDetails(videoId: string) {
  try {
    const video = await dbOperations.getVideo(videoId);
    
    if (!video) {
      return null;
    }

    return {
      ...video,
      video_id: video.video_id.toString(),
      created_at: video.created_at?.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching video:', error);
    return null;
  }
}

async function getWatchProgress(userId: string, videoId: string) {
  try {
    const progress = await dbOperations.getWatchProgress(userId, videoId);
    return progress?.timestamp || 0;
  } catch (error) {
    console.error('Error fetching watch progress:', error);
    return 0;
  }
}

export default async function WatchPage({ params, searchParams }: PageProps) {
  const video = await getVideoDetails(params.videoId);

  if (!video) {
    notFound();
  }

  // If there's a timestamp in the URL, use that, otherwise get the saved progress
  const initialProgress = searchParams.t 
    ? parseInt(searchParams.t, 10)
    : await getWatchProgress('default-user', params.videoId);

  const handleProgressUpdate = async (progress: number) => {
    'use server';
    
    try {
      await dbOperations.updateWatchProgress(
        'default-user',
        params.videoId,
        progress
      );
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<div>Loading video...</div>}>
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <VideoPlayer
            videoId={video.video_id}
            userId="default-user"
            videoUrl={video.video_url}
            initialProgress={initialProgress}
            onProgressUpdate={handleProgressUpdate}
          />
        </div>
      </Suspense>

      <div className="mt-6">
        <h1 className="text-2xl font-bold">{video.title}</h1>
        <p className="mt-2 text-gray-600">{video.description}</p>
        
        {video.tags && video.tags.size > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from(video.tags).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {video.metadata && Object.keys(video.metadata).length > 0 && (
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Object.entries(video.metadata).map(([key, value]) => (
              <div key={key} className="border rounded-lg p-3">
                <dt className="text-sm text-gray-500">{key}</dt>
                <dd className="mt-1 text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-xl">Loading video...</div>
    </div>
  );
}

export function Error({ error }: { error: Error }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-xl text-red-500">
        Error loading video: {error.message}
      </div>
    </div>
  );
}