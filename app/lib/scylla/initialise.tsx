import readline from 'readline';
import { scyllaClient } from "./client";
import Schema from '../entities/schemas.ts';

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

        // Connect the new client
        await scyllaClient.connect();
        console.log('✅ Connected to video_streaming keyspace');

        // Create tables using the new client
        for (const [tableName, tableSchema] of Object.entries(Schema.tables)) {
            if (executeAll.toLowerCase() === 'y') {
                try {
                    await scyllaClient.execute(tableSchema);
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
                        await scyllaClient.execute(tableSchema);
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
        Object.assign(scyllaClient, scyllaClient);

        console.log('✅ Database initialization completed successfully');
        rl.close();
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        rl.close();
        throw error;
    }
}