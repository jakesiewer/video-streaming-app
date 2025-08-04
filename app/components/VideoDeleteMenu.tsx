'use client';
import { LoadingState } from 'app/lib/entities/types';
import { useState } from 'react';
import { EllipsisHorizontalCircleIcon, ArrowPathIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface VideoDeleteMenuProps {
  videoId: string;
  onDelete: (videoId: string) => void;
}

export default function VideoDeleteMenu({ videoId, onDelete }: VideoDeleteMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  let [loadingState, setLoadingState] = useState(LoadingState.NEUTRAL);

  const handleDropdownToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleDeleteVideo = async () => {
    try {
      setLoadingState(LoadingState.LOADING);
      const response = await fetch(`/api/video?videoId=${videoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error deleting video:", errorData);
        setLoadingState(LoadingState.ERROR);
        return false;
      }
      setLoadingState(LoadingState.SUCCESS);
      onDelete(videoId);

      moveVideoToTrash(videoId)
        .then(console.log)
        .catch(console.error);

      return videoId;
    } catch (error) {
      setLoadingState(LoadingState.ERROR);
      console.error("Error deleting video:", error);
      return false;
    }
  }

  async function moveVideoToTrash(videoId: string) {
    try {
      const res = await fetch(`/api/signed-url/delete?videoId=${videoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to move video to trash");
      }

      const data = await res.json();
      return data; // contains { message, moved: [keys...] }
    } catch (err) {
      console.error("Error moving video to trash:", err);
      throw err;
    }
  }

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handleDeleteVideo();
    setIsOpen(false);
  };
  
  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={handleDropdownToggle}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="More options"
      >
        {loadingState === LoadingState.LOADING ? (
          <ArrowPathIcon className="h-4 w-4 text-gray-600 animate-spin" />
        ) : loadingState === LoadingState.SUCCESS ? (
          <CheckIcon className="h-4 w-4 text-green-600" />
        ) : loadingState === LoadingState.ERROR ? (
          <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
        ) : (
          <EllipsisHorizontalCircleIcon className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-8 z-20 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1">
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}