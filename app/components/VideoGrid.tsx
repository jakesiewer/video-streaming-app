'use client';

import VideoDeleteMenu from './VideoDeleteMenu';
import { Video } from 'app/lib/supabase/entities';
import Image from 'next/image';
import Link from 'next/link';

interface VideoGridProps {
  videos: Video[];
  canDelete: boolean;
  onDelete: (videoId: string) => void;
}

export default function VideoGrid({ videos, canDelete = true, onDelete }: VideoGridProps) {
  const cloudfrontUrl = process.env.NEXT_PUBLIC_AWS_CLOUDFRONT_URL;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <div key={String(video.video_id)} className="group">
          <Link href={`/watch/${video.video_id}`} className="block">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-200">
              <Image
                src={`${cloudfrontUrl}/user-videos/${video.video_id}/thumbnails/thumbnail.jpg`}
                alt={video.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
          </Link>
          <h3 className="mt-2 text-lg text-gray-800 font-semibold">{video.title}</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 line-clamp-2">
              {video.description}
            </p>
            {canDelete && (
              <VideoDeleteMenu
                videoId={video.video_id.toString()}
                onDelete={onDelete}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}