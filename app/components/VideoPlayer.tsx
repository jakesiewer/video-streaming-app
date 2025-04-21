'use client'
import React, { useEffect, useRef, useState } from 'react';
import { updateProgress } from 'app/actions/video';

interface VideoPlayerProps {
  videoId: string;
  userId: string;
  videoUrl: string;
  initialProgress: number;
}

const VideoPlayer = ({
  videoId,
  userId,
  videoUrl,
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

    try {
      console.log('userId: ', userId);
      const message = await updateProgress(userId, videoId, progress);
      console.log(message);
    } catch (error) {
      console.error('Error updating watch progress:', error);
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