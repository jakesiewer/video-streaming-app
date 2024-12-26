// lib/scylla.ts
import { Client, types } from 'cassandra-driver';
import { validate } from 'uuid';

// ScyllaDB client configuration
export const scyllaClient = new Client({
    contactPoints: ['localhost:9042'],
    localDataCenter: 'datacenter1',
    keyspace: 'video_streaming',
    pooling: {
        maxRequestsPerConnection: 1024,
        coreConnectionsPerHost: {
            [types.distance.local]: 2,
            [types.distance.remote]: 1
        }
    }
});

// Database schema and table definitions
const schema = {
    keyspace: `
    CREATE KEYSPACE IF NOT EXISTS video_streaming
    WITH replication = {
      'class': 'SimpleStrategy',
      'replication_factor': 1
    }
  `,
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
      )
    `,
        watch_progress: `
      CREATE TABLE IF NOT EXISTS video_streaming.watch_progress (
        user_id uuid,
        video_id uuid,
        timestamp int,
        last_watched timestamp,
        PRIMARY KEY ((user_id), video_id)
      ) WITH CLUSTERING ORDER BY (video_id ASC)
    `,
        user_videos: `
      CREATE TABLE IF NOT EXISTS video_streaming.user_videos (
        user_id uuid,
        video_id uuid,
        watched_percentage decimal,
        last_position int,
        last_watched timestamp,
        PRIMARY KEY (user_id, last_watched, video_id)
      ) WITH CLUSTERING ORDER BY (last_watched DESC, video_id ASC)
    `
    }
};

// Type definitions
export interface Video {
    video_id: types.Uuid;
    title: string;
    description: string;
    duration: number;
    thumbnail_url: string;
    video_url: string;
    created_at: Date;
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

// Database initialization function
export async function initializeDatabase() {
    try {
        // First ensure we're connected
        await scyllaClient.connect();
        console.log('Connected to ScyllaDB');

        // Create keyspace
        await scyllaClient.execute(schema.keyspace);
        console.log('Created keyspace: video_streaming');

        // Create a new client with the keyspace specified
        const clientWithKeyspace = new Client({
            contactPoints: ['localhost:9042'],
            localDataCenter: 'datacenter1',
            keyspace: 'video_streaming',
            pooling: {
                maxRequestsPerConnection: 1024,
                coreConnectionsPerHost: {
                    [types.distance.local]: 2,
                    [types.distance.remote]: 1
                }
            }
        });

        // Connect the new client
        await clientWithKeyspace.connect();
        console.log('Connected to video_streaming keyspace');

        // Create tables using the new client
        for (const [tableName, tableSchema] of Object.entries(schema.tables)) {
            await clientWithKeyspace.execute(tableSchema);
            console.log(`Created table: ${tableName}`);
        }

        // Shutdown the initial client as we don't need it anymore
        await scyllaClient.shutdown();

        // Replace the original client with the new one
        Object.assign(scyllaClient, clientWithKeyspace);

        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Utility functions for common database operations
export const dbOperations = {
    // Video operations
    async createVideo(video: Omit<Video, 'video_id' | 'created_at'>): Promise<types.Uuid> {
        const videoId = types.Uuid.random();
        const query = `
      INSERT INTO video_streaming.videos (
        video_id, title, description, duration, 
        thumbnail_url, video_url, created_at, 
        tags, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, toTimestamp(now()), ?, ?)
    `;

        await scyllaClient.execute(query, [
            videoId,
            video.title,
            video.description,
            video.duration,
            video.thumbnail_url,
            video.video_url,
            video.tags,
            video.metadata
        ], { prepare: true });

        return videoId;
    },

    async getVideo(videoId: string ): Promise<Video | null> {
        const query = 'SELECT * FROM video_streaming.videos WHERE video_id = ?';
        const result = await scyllaClient.execute(query, [videoId], { prepare: true });

        // If there's a result, map it to the Video interface
        if (result.rows.length > 0) {
            const row = result.rows[0];
;           return mapRowToVideo(row);
        }

        // Return null if no rows were found
        return null;
    },

    // Watch progress operations
    async updateWatchProgress(
        userId: string,
        videoId: string,
        timestamp: number
    ): Promise<void> {
        const query = `
      INSERT INTO video_streaming.watch_progress (
        user_id, video_id, timestamp, last_watched
      ) VALUES (?, ?, ?, toTimestamp(now()))
    `;

        await scyllaClient.execute(query, [
            userId,
            videoId,
            timestamp
        ], { prepare: true });

        // Update user_videos table as well
        await this.updateUserVideo(userId, videoId, timestamp);
    },

    async getWatchProgress(
        userId: string,
        videoId: string
    ): Promise<WatchProgress | null> {
        // const query = `SELECT * FROM video_streaming.watch_progress WHERE user_id = '${userId}' AND video_id = '${videoId}'`;
        const query = `SELECT * FROM video_streaming.watch_progress WHERE video_id = ${videoId}`;
    
        const result = await scyllaClient.execute(query, [], { prepare: true });

        // If there's a result, map it to the WatchProgress interface
        if (result.rows.length > 0) {
            const row = result.rows[0];
            mapRowToWatchProgress(row);
        }

        // Return null if no rows were found
        return null;
    },

    // User videos operations
    async updateUserVideo(
        userId: string,
        videoId: string,
        lastPosition: number
    ): Promise<void> {
        const video = await this.getVideo(videoId);
        if (!video) return;

        const watchedPercentage = (lastPosition / video.duration) * 100;

        const query = `
      INSERT INTO video_streaming.user_videos (
        user_id, video_id, watched_percentage, 
        last_position, last_watched
      ) VALUES (?, ?, ?, ?, toTimestamp(now()))
    `;

        await scyllaClient.execute(query, [
            userId,
            videoId,
            watchedPercentage,
            lastPosition
        ], { prepare: true });
    },

    async getContinueWatching(
        userId: string | types.Uuid,
        limit: number = 10
    ): Promise<UserVideo[]> {
        const query = `
      SELECT * FROM video_streaming.user_videos 
      WHERE user_id = ? 
      LIMIT ?
    `;

        const result = await scyllaClient.execute(query, [userId, limit], { prepare: true });
        
        const userVideos: UserVideo[] = result.rows.map(row => mapRowToUserVideo(row));

        return userVideos;
    }
};

// Mapping functions
export function mapRowToVideo(row: any): Video {
    return {
        video_id: row.video_id,
        title: row.title,
        description: row.description,
        duration: row.duration,
        thumbnail_url: row.thumbnail_url,
        video_url: row.video_url,
        created_at: row.created_at,
        tags: row.tags
    };
}

function mapRowToWatchProgress(row: any): WatchProgress {
    return {
        user_id: row.user_id,
        video_id: row.video_id,
        timestamp: row.timestamp,
        last_watched: row.last_watched
    };
}

function mapRowToUserVideo(row: any): UserVideo {
    return {
        user_id: row.user_id,
        video_id: row.video_id,
        watched_percentage: row.watched_percentage,
        last_position: row.last_position,
        last_watched: row.last_watched

    };
}

export async function initializeScyllaConnection() {
    try {
        await initializeDatabase();
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
}

// Initialize the client connection
scyllaClient.connect()
    .then(() => console.log('Connected to ScyllaDB'))
    .catch(err => console.error('Error connecting to ScyllaDB:', err));

export default scyllaClient;