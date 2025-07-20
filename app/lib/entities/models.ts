import { types } from 'cassandra-driver';

// ==================== Types ====================

export interface Video {
    video_id: types.Uuid;
    title: string;
    description: string;
    duration: number;
    thumbnail_url: string;
    video_url: string;
    created_at: Date | null;
    tags?: Set<string>;
    metadata?: { [key: string]: string };
}

export interface WatchProgress {
    user_id: types.Uuid;
    video_id: types.Uuid;
    timestamp: number;
    last_watched: Date;
}

export interface UserVideo {
    user_id: types.Uuid;
    video_id: types.Uuid;
    watched_percentage: number;
    last_position: number;
    last_watched: Date;
}

export interface VideosByUser {
    user_id: types.Uuid;
    video_id: types.Uuid;
}

export interface Role {
    role_id: types.Uuid;
    name: string;
    description: string;
    permissions: Set<string>;
    created_at: Date | null;
}