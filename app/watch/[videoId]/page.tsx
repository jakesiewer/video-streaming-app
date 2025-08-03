// app/watch/[videoId]/page.tsx

import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import VideoPlayer from '../../components/VideoPlayer';
import { getWatchProgress } from 'app/lib/scylla/queries';
import { getUserId } from 'app/lib/supabase/client/supabaseServerClient';
import { getVideoDetails } from 'app/lib/supabase/queries';

interface PageProps {
  params: {
    videoId: string;
  };
  searchParams: {
    t?: string;
  };
}

async function getProgress(videoId: string) {
  try {
    const progress = await getWatchProgress(videoId);
    return progress?.timestamp || 0;
  } catch (error) {
    console.error('Error fetching watch progress:', error);
    return 0;
  }
}

export default async function WatchPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params; // Await params if necessary
  const resolvedSearchParams = await searchParams;
  const videoId = resolvedParams.videoId.toString();
  const video = await getVideoDetails(videoId);
  if (!video) {
    notFound();
  }

  const initialProgress = resolvedSearchParams.t
    ? parseInt(resolvedSearchParams.t, 10)
    : await getProgress(videoId);
  
    console.log("Initial progress: " + initialProgress);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={<div>Loading video...</div>}>
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <VideoPlayer
            videoId={videoId}
            userId={await getUserId() || ''}
            initialProgress={initialProgress}
          />
        </div>
      </Suspense>
      <div className="mt-6">
        <h1 className="text-2xl text-gray-800 font-bold">{video.title}</h1>
        <p className="mt-2 text-gray-600">{video.description}</p>
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