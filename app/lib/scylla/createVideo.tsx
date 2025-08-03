import { scyllaClient } from "./client"

export async function createVideo(videoData: any) {
  const result = await scyllaClient.execute(
    `INSERT INTO videos_by_id (video_uuid, user_uuid, ) VALUES (?, ?, ?, ?)`,
    [videoData.id, videoData.title, videoData.description, videoData.user_id]
  );
  return result;
}
export async function assignVideoToUser(userId: string, videoId: string) {
  const result = await scyllaClient.execute(
    `INSERT INTO user_videos (user_id, video_id) VALUES (?, ?)`,
    [userId, videoId]
  );
  return result;
}