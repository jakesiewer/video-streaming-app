// app/page.tsx
import { getWatchedVideos } from './lib/scylla/queries';
import { getAllVideos } from './lib/supabase/queries';
import ContinueWatching from './components/ContinueWatching';
import VideoGrid from './components/VideoGrid';
import { getUserId } from './lib/supabase/client/supabaseServerClient';
import { redirect } from 'next/navigation';

export default async function Home() {
  const userId = await getUserId();
  if (!userId) {
    redirect('/login');
  }

  const [allVideos, watchedVideos] = await Promise.all([
    getAllVideos(),
    getWatchedVideos(userId)
  ]);

  return (
    <div className="space-y-8">
      {Array.isArray(watchedVideos) && watchedVideos.length > 0 && (
        <section>
          <h2 className="font-sans text-slate-800 text-2xl font-bold mb-4">Continue Watching</h2>
          <ContinueWatching videos={watchedVideos} />
        </section>
      )}
      {Array.isArray(allVideos) && allVideos.length > 0 && (
        <section>
          <h2 className="font-sans text-slate-800 text-2xl font-bold mb-4">All Videos</h2>
          <VideoGrid videos={allVideos} canDelete={false} />
        </section>
      )}
    </div>
  );
}