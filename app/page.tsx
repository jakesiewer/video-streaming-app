// app/page.tsx
import { getWatchedVideos } from './lib/scylla/queries';
import { getAllVideos } from './lib/supabase/queries';
import { getUserId } from './lib/supabase/client/supabaseServerClient';
import { redirect } from 'next/navigation';
import VideoSections from './components/VideoSections';

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
    <VideoSections
      initialAllVideos={allVideos}
      initialWatchedVideos={watchedVideos}
      canDelete={false}
    />
  );
}