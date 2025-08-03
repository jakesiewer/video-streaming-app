import { Client, types } from "cassandra-driver";

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