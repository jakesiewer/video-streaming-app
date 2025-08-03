import { WatchProgress } from "../entities/models";
import mappings from "../entities/mappings";
import { scyllaClient } from "./client";
import { getListOfVideos } from "../supabase/queries";
import { Video } from "../supabase/entities";

export async function updateWatchProgress(
    userId: string,
    videoId: string,
    timestamp: number
): Promise<boolean> {
    const query = `
      INSERT INTO video_streaming.watch_progress (
        user_id, video_id, timestamp, last_watched
      ) VALUES (?, ?, ?, toTimestamp(now()))
    `;
    try {
        await scyllaClient.execute(query, [
            userId,
            videoId,
            timestamp
        ], { prepare: true });
        return true;
    } catch (error) {
        console.error("Failed to update watch progress:", error);
        return false;
    }
}

export async function getWatchedVideos(userId: string): Promise<(Video & { progress: number })[]> {
    const query = `
      SELECT video_id, timestamp FROM video_streaming.watch_progress
      WHERE user_id = ?
    `;

    const videoIdWithTimestamp = await scyllaClient.execute(query, [userId], { prepare: true });
    const videos = await getListOfVideos(videoIdWithTimestamp.rows.map(row => row.video_id.toString()));

    return videos.map(video => {
        const progressRow = videoIdWithTimestamp.rows.find(row => row.video_id.toString() === video.video_id.toString());
        return {
            ...video,
            progress: progressRow ? progressRow.timestamp : 0
        };
    });
};

export async function getWatchProgress(
    videoId: string
): Promise<WatchProgress | null> {
    const query = `SELECT * FROM video_streaming.watch_progress WHERE video_id = ${videoId}`;
    const result = await scyllaClient.execute(query, [], { prepare: true });

    if (result.rows.length > 0) {
        const row = result.rows[0];
        mappings.mapRowToWatchProgress(row);
    }

    return null;
}