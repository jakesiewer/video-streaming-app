import { Video } from "app/lib/entities/models";
import { dbOperations } from "app/lib/scylla";
import { types } from "cassandra-driver";

export async function POST(request: Request) {
  const body = await request.json();
  const { videoId, userId, title, duration } = body;

  if (!userId || !videoId || !title || !duration) {
    return new Response('Video ID, User ID, Title, and Duration are required', { status: 400 });
  }

  const video: Video = {
    video_id: types.Uuid.fromString(videoId),
    title: title,
    description: 'Uploaded video :)',
    duration: duration,
    thumbnail_url: '',
    video_url: '',
    metadata: {},
    created_at: new Date(),
  }

  const createVideoResponse = await dbOperations.createVideo(video);
  const assignVideoResponse = await dbOperations.assignVideoToUser(types.Uuid.fromString(userId), types.Uuid.fromString(videoId));

  if (!createVideoResponse || !assignVideoResponse) {
    return new Response('Failed to create video or assign it to user', { status: 500 });
  }

  return new Response('Video created successfully', { status: 201 });
}