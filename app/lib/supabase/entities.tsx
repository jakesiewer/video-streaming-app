import { types } from "cassandra-driver";

export interface Video {
  video_id: types.Uuid;
  user_id: types.Uuid;
  title: string;
  description?: string;
  duration: number;
  created_at: Date;
}

export interface VideoInit {
  user_id: types.Uuid;
  title: string;
  description?: string;
  duration: number;
}