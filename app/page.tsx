// app/page.tsx
import { getWatchedVideos, getAllVideos } from './lib/scylla';
import ContinueWatching from './components/ContinueWatching';
import VideoGrid from './components/VideoGrid';



export default async function Home() {
  const [allVideos, watchedVideos] = await Promise.all([
    getAllVideos(),
    getWatchedVideos()
  ]);

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