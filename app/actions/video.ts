// app/actions/video.ts
'use server';

import { dbOperations } from "../lib/scylla";

export async function updateProgress(userId: string, videoId: string, progress: number) {
    try {
        console.log('Updating progress for video:', videoId, 'for user:', userId);
        console.log('Updating watch progress:', userId, videoId, progress);
        await dbOperations.updateWatchProgress(userId, videoId, progress);
        return { success: true };
    } catch (error) {
        console.error('Error updating watch progress:', error);
        return { success: false, error: 'Failed to update progress' };
    }
}