import ContinueWatching from "app/components/ContinueWatching";
import VideoGrid from "app/components/VideoGrid";
import { getWatchedVideos } from "app/lib/scylla/queries";
import { getUserId } from "app/lib/supabase/client/supabaseServerClient";
import { getVideosForUser } from "app/lib/supabase/queries";
import VideoUploadForm from "./VideoUploadForm";

export default async function Profile() {
    const userId = await getUserId();
    if (!userId) {
        return (
            <div className="max-w-3xl mx-auto py-10 space-y-10">
                <h1 className="text-2xl font-bold text-slate-800 mb-4">Profile Page</h1>
                <p className="text-red-600">User not found. Please log in.</p>
            </div>
        );
    }
    const [userVideos, watchedVideos] = await Promise.all([
        getVideosForUser(userId),
        getWatchedVideos(userId)
    ]);

    return (
        <div className="space-y-8">
            <VideoUploadForm />
            {/* User's Uploaded Videos Section */}
            {Array.isArray(watchedVideos) && watchedVideos.length > 0 && (
                <section>
                    <h2 className="font-sans text-slate-800 text-2xl font-bold mb-4">Continue Watching</h2>
                    <ContinueWatching videos={watchedVideos} />
                </section>
            )}
            {/* User's Watched Videos Section */}
            {Array.isArray(userVideos) && userVideos.length > 0 && (
                <section>
                    <h2 className="font-sans text-slate-800 text-2xl font-bold mb-4">Your Videos</h2>
                    <VideoGrid videos={userVideos} canDelete={true} />
                </section>
            )}
        </div>
    );
}