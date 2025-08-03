'use client'
import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
  userId: string;
  initialProgress: number;
}

async function updateWatchProgress(
  userId: string,
  videoId: string,
  timestamp: number
): Promise<boolean> {
  const response = await fetch('/api/update-progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      videoId,
      progress: timestamp,
    }),
  });

  if (!response.ok) {
    console.error('Failed to update watch progress:', response.statusText);
    return false;
  }

  return true;
};

const VideoPlayer = ({
  videoId,
  userId,
  initialProgress,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const progressUpdateInterval = useRef<NodeJS.Timeout | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = initialProgress;
    }
  }, [initialProgress]);

  useEffect(() => {
    const updateInterval = 5000; // Update progress every 5 seconds

    if (isPlaying) {
      progressUpdateInterval.current = setInterval(() => {
        if (videoRef.current) {
          const currentProgress = Math.floor(videoRef.current.currentTime);
          onProgressUpdate(currentProgress);
        }
      }, updateInterval);
    }

    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
  }, [isPlaying]);


  const onProgressUpdate = async (progress: number) => {
    const res = await updateWatchProgress(userId, videoId, progress);
    if (!res) {
      console.error('Failed to update progress:');
      setError('Failed to update progress. Please try again later.');
    } else {
      console.log('Progress updated successfully:', progress);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setError('Error loading video. Please try again.');
    console.error('Video error:', e);
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full"
        src={`/api/stream/${videoId}`}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        controls
        playsInline
      />
    </div>
  );
};

export default VideoPlayer;