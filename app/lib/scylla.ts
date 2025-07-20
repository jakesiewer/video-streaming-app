import readline from 'readline';

import { Video, WatchProgress, UserVideo, VideosByUser, } from './entities/models.ts';
import Mappings from './entities/mappings.ts';
import Schema from './entities/schemas.ts';
import { Client, types } from 'cassandra-driver';
import { getUserId } from './supabaseServerClient.ts';

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

export async function initializeDatabase() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = (query: string) => new Promise((resolve) => rl.question(query, resolve));

    try {
        console.log('Connecting to ScyllaDB...');
        await scyllaClient.connect();
        console.log('✅ Connected to ScyllaDB');

        // Ask if the user wants to execute all commands automatically
        const executeAll = (await askQuestion('Do you want to execute all initialization steps? (y/n): ')) as string;

        // Keyspace creation
        let keyspaceExists = false;
        if (executeAll.toLowerCase() === 'y') {
            try {
                await scyllaClient.execute(Schema.keyspace);
                console.log('✅ Created keyspace: video_streaming');
                keyspaceExists = true;
            } catch (error: any) {
                if (error.message.includes('already exists')) {
                    console.log('ℹ️ Keyspace video_streaming already exists');
                    keyspaceExists = true;
                } else {
                    throw error;
                }
            }
        } else {
            const createKeyspace = (await askQuestion('Create keyspace video_streaming? (y/n): ')) as string;
            if (createKeyspace.toLowerCase() === 'y') {
                try {
                    await scyllaClient.execute(Schema.keyspace);
                    console.log('✅ Created keyspace: video_streaming');
                    keyspaceExists = true;
                } catch (error: any) {
                    if (error.message.includes('already exists')) {
                        console.log('ℹ️ Keyspace video_streaming already exists');
                        keyspaceExists = true;
                    } else {
                        throw error;
                    }
                }
            } else {
                // Check if keyspace exists
                try {
                    await scyllaClient.execute('USE video_streaming');
                    console.log('ℹ️ Using existing keyspace: video_streaming');
                    keyspaceExists = true;
                } catch (error) {
                    console.error('❌ Error: Keyspace video_streaming does not exist and was not created');
                    rl.close();
                    throw new Error('Keyspace video_streaming does not exist and was not created');
                }
            }
        }

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
        console.log('✅ Connected to video_streaming keyspace');

        // Create tables using the new client
        for (const [tableName, tableSchema] of Object.entries(Schema.tables)) {
            if (executeAll.toLowerCase() === 'y') {
                try {
                    await clientWithKeyspace.execute(tableSchema);
                    console.log(`✅ Created table: ${tableName}`);
                } catch (error: any) {
                    if (error.message.includes('already exists')) {
                        console.log(`ℹ️ Table ${tableName} already exists`);
                    } else {
                        throw error;
                    }
                }
            } else {
                const createTable = (await askQuestion(`Create table ${tableName}? (y/n): `)) as any;
                if (createTable.toLowerCase() === 'y') {
                    try {
                        await clientWithKeyspace.execute(tableSchema);
                        console.log(`✅ Created table: ${tableName}`);
                    } catch (error: any) {
                        if (error.message.includes('already exists')) {
                            console.log(`ℹ️ Table ${tableName} already exists`);
                        } else {
                            throw error;
                        }
                    }
                } else {
                    console.log(`⏭️ Skipped creating table: ${tableName}`);
                }
            }
        }

        // Shutdown the initial client as we don't need it anymore
        await scyllaClient.shutdown();

        // Replace the original client with the new one
        Object.assign(scyllaClient, clientWithKeyspace);

        console.log('✅ Database initialization completed successfully');
        rl.close();
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        rl.close();
        throw error;
    }
}

// Utility functions for common database operations
export const dbOperations = {
    // Video operations
    async createVideo(video: Omit<Video, 'created_at'>): Promise<types.Uuid> {
        const query = `
      INSERT INTO video_streaming.videos (
        video_id, title, description, duration, 
        thumbnail_url, video_url, created_at, 
        tags, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, toTimestamp(now()), ?, ?)
    `;

        await scyllaClient.execute(query, [
            video.video_id,
            video.title,
            video.description,
            video.duration,
            video.thumbnail_url,
            video.video_url,
            video.tags,
            video.metadata
        ], { prepare: true });

        return video.video_id;
    },

    async assignVideoToUser(
        userId: types.Uuid,
        videoId: types.Uuid
    ): Promise<types.Uuid> {
        const query = `
      INSERT INTO video_streaming.videos_by_user (
        user_id, video_id
      ) VALUES (?, ?)
    `;

        await scyllaClient.execute(query, [
            userId,
            videoId
        ], { prepare: true });

        console.log(`Video ${videoId} assigned to user ${userId}`);
        
        return userId;
    },

    async getVideo(videoId: string): Promise<Video | null> {
        const query = 'SELECT * FROM video_streaming.videos WHERE video_id = ?';
        const result = await scyllaClient.execute(query, [videoId], { prepare: true });

        // If there's a result, map it to the Video interface
        if (result.rows.length > 0) {
            const row = result.rows[0];
            ; return Mappings.mapRowToVideo(row);
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
        console.log(query);
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
            Mappings.mapRowToWatchProgress(row);
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

        const userVideos: UserVideo[] = result.rows.map((row: types.Row) => Mappings.mapRowToUserVideo(row));

        return userVideos;
    }
};

export async function initializeScyllaConnection() {
    try {
        await initializeDatabase();
    } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
    }
}

export async function getAllVideos() {
    const result = await scyllaClient.execute(
        'SELECT * FROM video_streaming.videos LIMIT 20',
        [],
        { prepare: true, fetchSize: 20, consistency: types.consistencies.localQuorum }
    );
    const videos: Video[] = result.rows.map((row: types.Row) => Mappings.mapRowToVideo(row));
    return videos;
}

export async function getWatchedVideos() {
    const userId = await getUserId();
    const res = await fetch('http://localhost:3000/api/continue-watching?userId=' + userId, {
        method: 'GET',
        credentials: 'include'
    });

    if (!res.ok) {
        console.error(`Failed to fetch watched videos: ${res.status} ${res.statusText}`);
        return { videos: [] }; // Return an empty array or handle the error appropriately
    }

    try {
        const watched = await res.json();

        const videos: (Video & { progress: number })[] = watched.videos;
        return videos;
    } catch (error) {
        console.error('Error parsing JSON response:', error);
        return { videos: [] }; // Return an empty array or handle the error appropriately
    }
}

export async function getUserVideos(
    userId: string,
    limit: number = 10
): Promise<Video[]> {
    const videosByUserQuery = `
    SELECT * FROM video_streaming.videos_by_user 
    WHERE user_id = ? 
    LIMIT ?
  `;

    const videosQuery = `
    SELECT * FROM video_streaming.videos 
    WHERE video_id IN ? 
    LIMIT ?
  `;

    const result = await scyllaClient.execute(videosByUserQuery, [types.Uuid.fromString(userId), limit], { prepare: true });
    const videosByUser: VideosByUser[] = result.rows.map((row: types.Row) => Mappings.mapRowToVideosByUser(row));
    const videoIds: types.Uuid[] = videosByUser.map((video) => types.Uuid.fromString(video.video_id.toString()));
    if (videoIds.length === 0) {
        return []; // Return an empty array if no videos found for the user
    }

    const videosResult = await scyllaClient.execute(videosQuery, [videoIds, limit], { prepare: true });
    const videos: Video[] = videosResult.rows.map((row: types.Row) => Mappings.mapRowToVideo(row));

    return videos;
}

// Initialize the client connection
scyllaClient.connect()
    .then(() => console.log('Connected to ScyllaDB'))
    .catch(err => console.error('Error connecting to ScyllaDB:', err));

export default scyllaClient;