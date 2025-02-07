'use client'
import React, { useEffect, useRef, useState } from 'react';
import { updateProgress } from 'app/actions/video';

// commented lines will be uncommented upon completion of continue watching feature

interface VideoPlayerProps {
  videoId: string;
  userId: string;
  videoUrl: string;
  initialProgress: number;
}

const VideoPlayer = ({
  videoId,
  // userId,§
  videoUrl,
  initialProgress,
}: VideoPlayerProps) => {
  // const videoIdFromUrl = videoUrl.split('v=')[1];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // const [currentTime, setCurrentTime] = useState(initialProgress);
  // const [duration, setDuration] = useState(0);
  const progressUpdateInterval = useRef<NodeJS.Timeout | undefined>(undefined);

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
          // setCurrentTime(currentProgress);
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
      const message = await updateProgress('00000000-0000-0000-0000-000000000000', videoId, progress);
      console.log(message);
    } catch (error) {
      console.error('Error updating watch progress:', error);
    }
  };
  // const handleTimeUpdate = () => {
  //   if (videoRef.current) {
  //     setCurrentTime(videoRef.current.currentTime);
  //   }
  // };

  // const handleLoadedMetadata = () => {
  //   if (videoRef.current) {
  //     setDuration(videoRef.current.duration);
  //   }
  // };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full"
        src={videoUrl}
        // onTimeUpdate={handleTimeUpdate}
        // onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        controls
      />
    </div>
  );
};

export default VideoPlayer;