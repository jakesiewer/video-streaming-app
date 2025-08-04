// app/components/VideoSections.tsx
"use client";
import { useState } from "react";
import ContinueWatching from "./ContinueWatching";
import VideoGrid from "./VideoGrid";
import { Video } from "app/lib/supabase/entities";

interface VideoSectionsProps {
    initialAllVideos: Video[];
    initialWatchedVideos: (Video & { progress: number })[];
    canDelete: boolean;
}

export default function VideoSections({ initialAllVideos, initialWatchedVideos, canDelete }: VideoSectionsProps) {
    const [allVideos, setAllVideos] = useState(initialAllVideos);
    const [watchedVideos, setWatchedVideos] = useState(initialWatchedVideos);

    async function handleDelete(videoId: string) {
        if (!videoId) return;
        
        setAllVideos(prev => prev.filter(v => v.video_id.toString() !== videoId));
        setWatchedVideos(prev => prev.filter(v => v.video_id.toString() !== videoId));
    }

    return (
        <div className="space-y-8">
            {watchedVideos.length > 0 && (
                <section>
                    <h2 className="font-sans text-slate-800 text-2xl font-bold mb-4">Continue Watching</h2>
                    <ContinueWatching videos={watchedVideos} />
                </section>
            )}
            {allVideos.length > 0 && (
                <section>
                    <h2 className="font-sans text-slate-800 text-2xl font-bold mb-4">All Videos</h2>
                    <VideoGrid videos={allVideos} onDelete={handleDelete} canDelete={canDelete} />
                </section>
            )}
        </div>
    );
}