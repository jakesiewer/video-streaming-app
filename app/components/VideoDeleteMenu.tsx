'use client';
import { useState } from 'react';
import { EllipsisHorizontalCircleIcon } from '@heroicons/react/24/outline';

interface VideoDeleteMenuProps {
  videoId: string;
  onDelete?: (videoId: string) => void;
}

export default function VideoDeleteMenu({ videoId, onDelete }: VideoDeleteMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDropdownToggle = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onDelete?.(videoId);
    setIsOpen(false);
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={handleDropdownToggle}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        aria-label="More options"
      >
        <EllipsisHorizontalCircleIcon className="h-4 w-4 text-gray-600" />
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