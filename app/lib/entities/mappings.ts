import { Video, WatchProgress, UserVideo, User, Role } from './models.ts';

// ==================== Mapping Functions ====================

// Video-related mapping functions
export function mapRowToVideo(row: any): Video {
    return {
        video_id: row.video_id,
        title: row.title,
        description: row.description,
        duration: row.duration,
        thumbnail_url: row.thumbnail_url,
        video_url: row.video_url,
        created_at: row.created_at,
        tags: row.tags,
        metadata: row.metadata
    };
}

export function mapRowToWatchProgress(row: any): WatchProgress {
    return {
        user_id: row.user_id,
        video_id: row.video_id,
        timestamp: row.timestamp,
        last_watched: row.last_watched
    };
}

export function mapRowToUserVideo(row: any): UserVideo {
    return {
        user_id: row.user_id,
        video_id: row.video_id,
        watched_percentage: row.watched_percentage,
        last_position: row.last_position,
        last_watched: row.last_watched
    };
}

// User-related mapping functions
export function mapRowToUser(row: any): User {
    return {
        user_id: row.user_id,
        username: row.username,
        email: row.email,
        password_hash: row.password_hash,
        role_id: row.role_id,
        created_at: row.created_at,
        last_login: row.last_login,
        metadata: row.metadata
    };
}

export function mapRowToRole(row: any): Role {
    return {
        role_id: row.role_id,
        name: row.name,
        description: row.description,
        permissions: row.permissions || new Set(),
        created_at: row.created_at
    };
}

// Add this at the bottom of the file
export default {
    mapRowToVideo,
    mapRowToWatchProgress,
    mapRowToUserVideo,
    mapRowToUser,
    mapRowToRole
};