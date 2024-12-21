// scripts/initDb.ts
import { initializeDatabase } from '../lib/scylla.ts';

async function init() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

init();