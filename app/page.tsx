// app/page.tsx
import { scyllaClient, Video, mapRowToVideo } from './lib/scylla';
import Link from 'next/link';
import ContinueWatching from './components/ContinueWatching';
import VideoGrid from './components/VideoGrid';

async function getAllVideos() {
  const result = await scyllaClient.execute(
    'SELECT * FROM video_streaming.videos LIMIT 20'
  );
  const videos: Video[] = result.rows.map(row => mapRowToVideo(row));
  return videos;
}

async function getWatchedVideos() {
  const res = await fetch('http://localhost:3000/api/continue-watching?userId=00000000-0000-0000-0000-000000000000');
  const watched = await res.json();

  return watched.videos;
}

export default async function Home() {
  const allVideos = await getAllVideos();
  const watchedVideos = await getWatchedVideos();

  return (
    <div className="space-y-8">
      {/* Continue Watching Section */}
      <section>
        <h2 className="font-sans text-slate-800 text-2xl font-bold mb-4">Continue Watching</h2>
        <ContinueWatching videos={watchedVideos}/>
      </section>

      {/* All Videos Section */}
      <section>
        <h2 className="font-sans text-slate-800 text-2xl font-bold mb-4">All Videos</h2>
        <VideoGrid videos={allVideos} />
      </section>
    </div>
  );
}