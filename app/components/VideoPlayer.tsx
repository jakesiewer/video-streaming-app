'use client'
import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  videoId: string;
  userId: string;
  videoUrl: string;
  initialProgress: number;
  onProgressUpdate: (progress: number) => void;
}

const VideoPlayer = ({
  videoId,
  userId,
  videoUrl,
  initialProgress,
  onProgressUpdate,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialProgress);
  const [duration, setDuration] = useState(0);
  const progressUpdateInterval = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = initialProgress;
    }
  }, [initialProgress]);

  useEffect(() => {
    const updateInterval = 5000; // Update progress every 5 seconds
    console.log("Playing video: " + isPlaying);
    if (isPlaying) {
      progressUpdateInterval.current = setInterval(() => {
        if (videoRef.current) {
          const currentProgress = Math.floor(videoRef.current.currentTime);
          setCurrentTime(currentProgress);
          onProgressUpdate(currentProgress);
        }
      }, updateInterval);
    }

    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current);
      }
    };
  }, [isPlaying, onProgressUpdate]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      onProgressUpdate(newTime);
    }
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full"
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        controls
      />
      
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 text-white">
        <div className="flex items-center gap-4">
          <span className="text-sm">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="flex-grow h-2 rounded-lg appearance-none bg-gray-600 cursor-pointer"
          />
          <span className="text-sm">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;