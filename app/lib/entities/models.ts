import { types } from 'cassandra-driver';

// ==================== Types ====================

// Video-related interfaces
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

// User-related interfaces
export interface User {
    user_id: types.Uuid;
    username: string;
    email: string;
    password_hash: string;
    role_id: types.Uuid;
    created_at: Date | null;
    last_login: Date | null;
    metadata?: { [key: string]: string };
}

export interface Role {
    role_id: types.Uuid;
    name: string;
    description: string;
    permissions: Set<string>;
    created_at: Date | null;
}

export interface Permission {
    name: string;
    description: string;
    category: string;
}

export interface UserPermission {
    user_id: types.Uuid;
    permission_name: string;
    granted: boolean;
    granted_at: Date;
}