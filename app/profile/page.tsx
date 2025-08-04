import { getWatchedVideos } from "app/lib/scylla/queries";
import { getUserId } from "app/lib/supabase/client/supabaseServerClient";
import { getVideosForUser } from "app/lib/supabase/queries";
import VideoUploadForm from "./VideoUploadForm";
import VideoSections from "app/components/VideoSections";
import { redirect } from "next/navigation";

export default async function Profile() {
  const userId = await getUserId();
  if (!userId) {
    redirect('/login');
  }
  const [userVideos, watchedVideos] = await Promise.all([
    getVideosForUser(userId),
    getWatchedVideos(userId)
  ]);

  return (
    <div className="space-y-8">
      <VideoUploadForm />
      {/* User's Uploaded Videos Section */}
      <VideoSections
        initialAllVideos={userVideos}
        initialWatchedVideos={watchedVideos}
        canDelete={true}
      />
    </div>
  );
}