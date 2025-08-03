// app/api/update-progress/route.ts
import { updateWatchProgress } from "app/lib/scylla/queries";

export async function POST(request: Request) {
    const body = await request.json();
    const { userId, videoId, progress } = body;

    if (!userId || !videoId || progress === undefined) {
        return new Response('Invalid request body', { status: 400 });
    }

    const result = await updateWatchProgress(userId, videoId, progress);
    if (!result) {
        return new Response('Failed to update progress', { status: 500 });
    }

    return new Response('Progress updated successfully', { status: 200 });
}