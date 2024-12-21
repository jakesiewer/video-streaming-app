// app/page.tsx
import { scyllaClient, Video, mapRowToVideo } from './lib/scylla';
import Link from 'next/link';
import ContinueWatching from './components/ContinueWatching';
import VideoGrid from './components/VideoGrid';

async function getVideos() {
  const result = await scyllaClient.execute(
    'SELECT * FROM video_streaming.videos LIMIT 20'
  );
  const videos: Video[] = result.rows.map(row => mapRowToVideo(row));
  console.log(videos);
  return videos;
}

export default async function Home() {
  const videos = await getVideos();

  return (
    <div className="space-y-8">
      {/* Continue Watching Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Continue Watching</h2>
        <ContinueWatching userId="default-user" />
      </section>

      {/* All Videos Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">All Videos</h2>
        <VideoGrid videos={videos} />
      </section>
    </div>
  );
}