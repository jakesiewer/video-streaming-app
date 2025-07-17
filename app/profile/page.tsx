import ContinueWatching from "app/components/ContinueWatching";
import VideoGrid from "app/components/VideoGrid";
import { getWatchedVideos, getUserVideos } from "app/lib/scylla";
import { getUserId } from "app/lib/supabaseServerClient";

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
        getUserVideos(userId),
        getWatchedVideos()
    ]);
    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Profile Page</h1>
            {/* Upload Video Section */}
            <section className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Upload a Video</h2>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="video-title">
                            Video Title
                        </label>
                        <input
                            id="video-title"
                            type="text"
                            className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter video title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="video-file">
                            Video File
                        </label>
                        <input
                            id="video-file"
                            type="file"
                            className="block w-full text-gray-700"
                            accept="video/*"
                        />
                    </div>
                    <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
                    >
                        Upload Video
                    </button>
                </form>
            </section>
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
                    <VideoGrid videos={userVideos} />
                </section>
            )}
        </div>
    );
}