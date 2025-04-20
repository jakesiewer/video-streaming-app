// Database schema and table definitions
export default {
    keyspace: `
    CREATE KEYSPACE IF NOT EXISTS video_streaming
    WITH replication = {
      'class': 'SimpleStrategy',
      'replication_factor': 1
    }`,
    tables: {
        videos: `
        CREATE TABLE IF NOT EXISTS video_streaming.videos (
            video_id uuid PRIMARY KEY,
            title text,
            description text,
            duration int,
            thumbnail_url text,
            video_url text,
            created_at timestamp,
            tags set<text>,
            metadata map<text, text>
        )`,
        watch_progress:
            `CREATE TABLE IF NOT EXISTS video_streaming.watch_progress (
            user_id uuid,
            video_id uuid,
            timestamp int,
            last_watched timestamp,
            PRIMARY KEY ((user_id), video_id)
        ) WITH CLUSTERING ORDER BY (video_id ASC)`,
        user_videos:
            `CREATE TABLE IF NOT EXISTS video_streaming.user_videos (
            user_id uuid,
            video_id uuid,
            watched_percentage decimal,
            last_position int,
            last_watched timestamp,
            PRIMARY KEY (user_id, last_watched, video_id)
        ) WITH CLUSTERING ORDER BY (last_watched DESC, video_id ASC)`,
        // User table
        users:
            `CREATE TABLE IF NOT EXISTS video_streaming.users (
            user_id uuid PRIMARY KEY,
            username text,
            email text,
            password_hash text,
            role_id uuid,
            created_at timestamp,
            last_login timestamp,
            metadata map<text, text>
        )`,
        // Roles table
        roles: `
        CREATE TABLE IF NOT EXISTS video_streaming.roles (
            role_id uuid PRIMARY KEY,
            name text,
            description text,
            permissions set<text>,
            created_at timestamp
        )`,
        // Role permissions table - denormalized for quick lookups
        role_permissions: `
        CREATE TABLE IF NOT EXISTS video_streaming.role_permissions (
            role_id uuid,
            permission_name text,
            granted_at timestamp,
            PRIMARY KEY (role_id, permission_name)
        ) WITH CLUSTERING ORDER BY (permission_name ASC)`,
        // User permissions table - for individual permission overrides
        user_permissions: `
        CREATE TABLE IF NOT EXISTS video_streaming.user_permissions (
            user_id uuid,
            permission_name text,
            granted boolean,
            granted_at timestamp,
            PRIMARY KEY (user_id, permission_name)
        ) WITH CLUSTERING ORDER BY (permission_name ASC)`
    }
};