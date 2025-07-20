import Link from 'next/link';
import Image from 'next/image';
import { Video } from '../lib/entities/models';
import { env } from 'process';

interface ContinueWatchingProps {
  videos: (Video & { progress: number })[];
}

export default function ContinueWatching({ videos }: ContinueWatchingProps) {
  if (videos.length === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <Link
          key={String(video.video_id)}
          href={`/watch/${video.video_id}?t=${video.progress}`}
          className="block group"
        >
          <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-200">
            <Image
              src={`${env.AWS_CLOUDFRONT_URL}/user-videos/${video.video_id}/thumbnails/thumbnail.jpg`}
              alt={video.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-blue-600"
                style={{
                  width: `${(video.progress / video.duration) * 100}%`,
                }}
              />
            </div>
          </div>
          <h3 className="mt-2 text-gray-800 text-lg font-semibold">{video.title}</h3>
        </Link>
      ))}
    </div>
  );
}