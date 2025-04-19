import { Video } from '../lib/entities/models';
import Image from 'next/image';
import Link from 'next/link';

interface VideoGridProps {
  videos: Video[];
}

export default function VideoGrid({ videos }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <Link
          key={String(video.video_id)}
          href={`/watch/${video.video_id}`}
          className="block group"
        >
          <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-200">
            <Image
              src={video.thumbnail_url}
              alt={video.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <h3 className="mt-2 text-lg text-gray-800 font-semibold">{video.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {video.description}
          </p>
        </Link>
      ))}
    </div>
  );
}